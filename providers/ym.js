// Generated by LiveScript 1.6.0
(function(){
  var Wallet, ref$, map, find, split, div, times, plus, minus, moment, calcFee, getKeys, transformTx, getTransactions, createTransaction, pushTx, getTotalReceived, getApi, getBalance, out$ = typeof exports != 'undefined' && exports || this, toString$ = {}.toString;
  Wallet = require('yandex-money-sdk').Wallet;
  ref$ = require('prelude-ls'), map = ref$.map, find = ref$.find, split = ref$.split, map = ref$.map;
  ref$ = require('../math.js'), div = ref$.div, times = ref$.times, plus = ref$.plus, minus = ref$.minus;
  moment = require('moment');
  out$.calcFee = calcFee = function(arg$, cb){
    var network, feeType, account, amount, to, data, fixed, def;
    network = arg$.network, feeType = arg$.feeType, account = arg$.account, amount = arg$.amount, to = arg$.to, data = arg$.data;
    fixed = 50;
    if (+amount === 0) {
      return cb(null, fixed);
    }
    def = plus(fixed, times(div(amount, 100), 2));
    return cb(null, def);
  };
  out$.getKeys = getKeys = function(arg$, cb){
    var network, mnemonic, index;
    network = arg$.network, mnemonic = arg$.mnemonic, index = arg$.index;
    return getApi(network.privateKey, function(err, api){
      if (err != null) {
        return cb(err);
      }
      return api.accountInfo(function(err, info){
        var address;
        if (err != null) {
          return cb(err);
        }
        address = info.account;
        return cb(null, {
          privateKey: network.privateKey,
          address: address
        });
      });
    });
  };
  transformTx = curry$(function(network, t){
    var url, tx, amount, time, fee, type, from, to2;
    url = network.api.url;
    tx = t.operation_id;
    amount = t.amount;
    time = moment.utc(t.date).unix();
    fee = 'n/a';
    type = t.direction.toUpperCase();
    from = t.direction === 'out' ? 'my account' : void 8;
    to2 = t.direction === 'out' ? 'recipient' : void 8;
    return {
      network: 'ym',
      tx: tx,
      amount: amount,
      fee: fee,
      time: time,
      url: url,
      from: t.from,
      to: to2,
      type: type
    };
  });
  out$.getTransactions = getTransactions = function(arg$, cb){
    var network, address;
    network = arg$.network, address = arg$.address;
    return getApi(network.privateKey, function(err, api){
      if (err != null) {
        return cb(err);
      }
      return api.operationHistory({
        records: 25
      }, function(err, info){
        var txs;
        if (err != null) {
          return cb(err);
        }
        if (toString$.call(info.operations).slice(8, -1) !== 'Array') {
          return cb("expected array");
        }
        txs = map(transformTx(network))(
        info.operations);
        return cb(null, txs);
      });
    });
  };
  out$.createTransaction = createTransaction = curry$(function(arg$, cb){
    var network, account, recipient, amount, amountFee, data, feeType, txType;
    network = arg$.network, account = arg$.account, recipient = arg$.recipient, amount = arg$.amount, amountFee = arg$.amountFee, data = arg$.data, feeType = arg$.feeType, txType = arg$.txType;
    return getBalance({
      network: network,
      address: account.address
    }, function(err, balance){
      var rest, options;
      if (err != null) {
        return cb(err);
      }
      rest = minus(balance, plus(amount, amountFee));
      if (+rest < 0) {
        return cb("Balance is not enough to send this amount");
      }
      if (err != null) {
        return cb(err);
      }
      options = {
        pattern_id: 'p2p',
        to: recipient,
        amount_due: amount,
        comment: "Payment",
        message: "Payment",
        label: "payment",
        test_payment: false,
        test_result: 'success'
      };
      return api.requestPayment(options, function(err, res){
        var rawtx;
        if (err != null) {
          return cb(err);
        }
        if (res.status !== 'success') {
          return cb(res);
        }
        rawtx = data.request_id;
        return cb(null, {
          rawtx: rawtx
        });
      });
    });
  });
  out$.pushTx = pushTx = curry$(function(arg$, cb){
    var network, rawtx;
    network = arg$.network, rawtx = arg$.rawtx;
    if (toString$.call(rawtx).slice(8, -1) !== 'String') {
      return cb("rawtx should be an string");
    }
    return getApi(network.privateKey, function(err, api){
      var request_id;
      if (err != null) {
        return cb(err);
      }
      request_id = rawtx;
      return api.processPayment({
        request_id: request_id
      }, function(err, data){
        if (err != null) {
          return cb(err);
        }
        if (data.status !== 'success') {
          return cb(data);
        }
        return cb(null, data.operation_id);
      });
    });
  });
  out$.getTotalReceived = getTotalReceived = function(arg$, cb){
    var address, network;
    address = arg$.address, network = arg$.network;
    return cb("Not Implemented");
  };
  getApi = function(privateKey, cb){
    var api;
    api = new Wallet(privateKey);
    return cb(null, api);
  };
  out$.getBalance = getBalance = function(arg$, cb){
    var network, address;
    network = arg$.network, address = arg$.address;
    if ((network != null ? network.privateKey : void 8) == null) {
      return cb("private key is required");
    }
    return getApi(network.privateKey, function(err, api){
      if (err != null) {
        return cb(err);
      }
      return api.accountInfo(function(err, info){
        if (err != null) {
          return cb(err);
        }
        return cb(null, info.balance);
      });
    });
  };
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);