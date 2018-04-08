import bcypher from 'blockcypher';
import User from '../models/user';
const bcapi = new bcypher('bcy', 'test', '9f144d98e3f1497087b2c9f3381eb47b');

import bigi from 'bigi';

import bitcoin from 'bitcoinjs-lib';
import buffer from 'buffer';
import Order from '../models/order';
import MarketOrder from '../models/marketOrder';
import async from 'async';
import numeral from 'numeral';


export function getHash(txHash) {
  return new Promise((resolve, reject) => {
    bcapi.getTX(txHash, {},(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.confirmations);
      }
    });
  });
}
export function addressToAddressWithFee(userFrom, userTo, amount, fee, exchangeFee) {
  return new Promise((resolve) => {
    const newtx = {
      inputs: [{addresses: [userFrom.address]}],
      outputs: [
        {addresses: [userTo.address], value: Number(amount)}
      ],
      fees: Number(fee)
    };
    bcapi.newTX(newtx, function(err, data) {
      if (err) {
        resolve({ code: 'error', error: err });
      } else {
        let keys = null;
        keys = new bitcoin.ECPair(bigi.fromHex(userFrom.private));
        data.pubkeys = [];
        data.signatures = data.tosign.map( function(tosign) {
          data.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
          return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
        });
        bcapi.sendTX(data, function (err2, ret) {
          if (err2) {
            resolve({ code: 'error', error: err2 });
          } else {
            const webhook2 = {
              'event': 'tx-confirmation',
              'address': userTo.address,
              'url': `http://c2e8dfae.ngrok.io/api/trade/${userTo.address}`,
              confirmations: 6
            };
            bcapi.createHook(webhook2, (err3, d) => {
            });
            resolve({ code: 'done' });
          }
        });
      }
    });
  });
}

export function addAddress() {
  return new Promise((resolve, reject) => {
    bcapi.genAddr({},(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
export function faucet(address) {
  bcapi.faucet(address, 500000, () => {});
}
export function getAddress(address) {
  return new Promise((resolve, reject) => {
    bcapi.getAddr(address, {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
export function getHold(id) {
  return new Promise((resolve, reject) => {
    Order.find({ userId: id, coin: 'BTC', type: 'sell', $or: [{ stage: 'open' }] }).exec((err, order) => {
      if (err) {
        reject(err);
      } else {
        let hold = 0;
        order.map((o) => {
          hold += o.amountRemain;
        });
        MarketOrder.find({
          $or: [
            { createUser: id, type: 'sell', stage: { $in: ['first', 'second', 'third']} },
            { userId: id, type: 'buy', stage: { $in: ['second', 'third'] } }
          ]
        }).exec((err2, market) => {
          if (err2) {
            resolve(hold);
          } else {
            market.map((o) => {
              if (o.type === 'sell') {
                hold += o.max;
              } else {
                hold += o.amount;
              }
            });
            resolve(hold);
          }
        });
      }
    });
  });
}
// create transaction, sign and send to the network
// userFrom -> userTo
//
function findUsers(market, callback) {
  let idFrom = '';
  let idTo = '';
  const type = market.type === 'sell';

  idFrom = type ? market.createUser._id : market.userId._id ;
  idTo = type ? market.userId._id : market.createUser._id;
  async.parallel({
    userFrom: (cb) => { User.findOne({ _id: idFrom }).exec(cb); },
    userTo: (cb) => { User.findOne({ _id: idTo }).exec(cb); }
  }, (err, result) => {
    callback(err, result.userFrom, result.userTo);
  });
}
export function send(market, addressCoin, feeTrade, minimumFeeCoin, feeNetwork) {
  return new Promise((resolve, reject) => {
    findUsers(market, (err, userFrom, userTo) => {
      if (err) {
        reject(err);
      } else {
        const amount = market.amount;
        if (amount < 7000) return;
        if (amount < 4000000) {
          microTransaction(userFrom, userTo, market, addressCoin, feeTrade, minimumFeeCoin, feeNetwork)
            .catch((err2) => {
              reject(err2);
            })
            .then(data => resolve(data));
          return;
        }
        normalTransaction(userFrom, userTo, market, addressCoin, feeTrade, feeNetwork)
          .catch((err) => {
            reject(err);
          })
          .then(data => resolve(data))
      }
    });
  });
}
function normalTransaction(userFrom, userTo, orderSell, orderBuy, addressFee, feeTrade, feeNetwork) {
  return new Promise((resolve, reject) => {
    const amount = (orderSell.amountRemain <= orderBuy.amountRemain) ? orderSell.amountRemain : orderBuy.amountRemain;
    const af = userFrom.addresses.filter((a) => {
      return a.coin === orderSell.coin;
    });
    const at = userTo.addresses.filter((a) => {
      return a.coin === orderBuy.coin;
    });
    const addressFrom = (af.length > 0) ? af[0] : [];
    const addressTo = (at.length > 0) ? at[0] : [];
    if (af.length === 0 || at.length === 0) reject('addressError');
    const newtx = {
      inputs: [{addresses: [addressFrom.address]}],
      outputs: [
        {addresses: [addressTo.address], value: Number(amount) - feeNetwork - feeTrade},
        // {addresses: [addressFee], value: Number(feeTrade)}
      ],
      fees: Number(feeNetwork)
    };
    bcapi.newTX(newtx, function (err, data) {
      if (err) {
        reject('transactionError');
      } else {
        if (data.hasOwnProperty('errors') || data.hasOwnProperty('error')) reject('transactionError');
        let keys = null;
        keys = new bitcoin.ECPair(bigi.fromHex(addressFrom.private));
        data.pubkeys = [];
        data.signatures = data.tosign.map((tosign) => {
          data.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
          return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
        });
        bcapi.sendTX(data, (err2, ret) => {
          if (err2) {
            console.log(err2);
            reject('signError');
          } else {
            if (ret && !ret.hasOwnProperty('error')) {
              resolve({ txHash: ret.tx.hash, fee: ret.tx.fees });
            } else {
              reject('sendError');
            }
          }
        });
      }
    });
  });
}


function createMicroTransaction(micro, microFee, callback) {
  async.parallel({
    micro: (cb) => createMicro(micro, cb),
    microFee: (cb) => createMicro(microFee, cb)
  }, (err, result) => {
    callback(err, result.micro, result.microFee);
  });
}
function createMicro(micro, cb) {
  bcapi.microTX(micro, (err, data) => {
    if (err) {
      cb(err);
      return;
    } else {
      console.log(data);
      if (data.hasOwnProperty('errors') || data.hasOwnProperty('error')) {
        cb('not enough fund');
        return;
      }
      cb(null, data);
    }
  });
}
function signTransactions(data, dataFee, addressFrom, callback) {
  async.parallel({
    data: (cb) => signTransaction(data, addressFrom, cb),
    dataFee: (cb) => signTransaction(dataFee, addressFrom, cb)
  }, (err, result) => {
    callback(err, result.data, result.dataFee);
  });
}
function signTransaction(data, addressFrom, cb) {
  let keys = null;
  keys = new bitcoin.ECPair(bigi.fromHex(addressFrom.private));
  data.pubkeys = [];
  data.signatures = data.tosign.map((tosign) => {
    data.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
    return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
  });
  bcapi.microTX(data, (err, ret) => {
    if (err) {
      cb('signError');
    } else {
      if (ret && !ret.hasOwnProperty('error')) {
        cb(null, { txHash: ret.hash, fee: ret.fees });
      } else {
        cb('sendError');
      }
    }
  });
}
function microTransaction(userFrom, userTo, market, addressFee, feeCoin, minimumFeeCoin, feeNetwork) {
  return new Promise((resolve, reject) => {
    const initAmount = market.amount;
    const feeTrade = (initAmount * (feeCoin * 2 / 100) >= (minimumFeeCoin * 2)) ? (initAmount * (feeCoin * 2 / 100)) : (minimumFeeCoin * 2);
    const amount = initAmount - feeTrade;
    console.log(initAmount);
    console.log(amount);
    console.log(feeTrade);
    const af = userFrom.addresses.filter((a) => {
      return a.coin === market.coin;
    });
    const at = userTo.addresses.filter((a) => {
      return a.coin === market.coin;
    });
    const addressFrom = (af.length > 0) ? af[0] : [];
    const addressTo = (at.length > 0) ? at[0] : [];
    const micro = {
      from_pubkey: addressFrom.public,
      to_address: addressTo.address,
      value_satoshis: amount,
    };
    const microFee = {
      from_pubkey: addressFrom.public,
      to_address: addressFee,
      value_satoshis: feeTrade,
    };
    console.log(micro);
    console.log(microFee);
    createMicroTransaction(micro, microFee, (err, micro, microFee) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        signTransactions(micro, microFee, addressFrom, (err2, data, dataFee) => {
          if (err2) {
            console.log(err2);
            reject(err2);
          } else {
            resolve({
              txHash: data.txHash,
              feeNetwork: data.fee,
              txHashFee: dataFee.txHash,
              feeTrade: feeTrade / 2,
              feeTradeAdmin: feeTrade - dataFee.fee
            });
          }
        });
      }
    })
  });
}
export function directTransfer(addressFrom, addressPrivate, addressTo, transferAmount) {
  return new Promise((resolve, reject) => {
    const newtx = {
      inputs: [{addresses: [addressFrom]}],
      outputs: [
        {addresses: [addressTo], value: Number(transferAmount)}
      ],
      fees: Number(50000)
    };
    bcapi.newTX(newtx,(err, data) => {
      if (err) {
        reject('transactionError');
      } else {
        if (data.hasOwnProperty('errors')) {
          reject('not enough fund');
        } else {
          if (data.hasOwnProperty('errors') || data.hasOwnProperty('error')) reject('transactionError');
          let keys = null;
          keys = new bitcoin.ECPair(bigi.fromHex(addressPrivate));
          data.pubkeys = [];
          data.signatures = data.tosign.map((tosign) => {
            data.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
            return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
          });
          bcapi.sendTX(data, function (err2, ret) {
            if (err2) {
              reject('signError');
            } else {
              if (ret) {
                const webhook2 = {
                  'event': 'tx-confirmation',
                  'address': addressTo,
                  'url': `http://c2e8dfae.ngrok.io/api/trade/${addressTo}`,
                  confirmations: 6
                };
                bcapi.createHook(webhook2, () => {
                });
                resolve(ret.tx.hash);
              }
            }
          });
        }
      }
    });
  });
}
export function createHook(webhook) {
  bcapi.createHook(webhook, () => {});
}
export function deleteHook(id) {
  bcapi.delHook(id, () => {});
}
