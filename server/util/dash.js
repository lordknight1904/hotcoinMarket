import bcypher from 'blockcypher';

const bcapi = new bcypher('btc', 'test3', 'fbbd90bc4f6543a2b79275121f751c5a');

import bigi from 'bigi';

import bitcoin from 'bitcoinjs-lib';
import buffer from 'buffer';
import Order from '../models/order';


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
        resolve(hold);
      }
    });
  });
}
// create transaction, sign and send to the network
// userFrom -> userTo
//
export function transactionWithFee(userFrom, userTo, orderSell, orderBuy, addressFee, feeTrade, feeNetwork) {
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
        {addresses: [addressFee], value: Number(feeTrade)}
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
        data.signatures = data.tosign.map(function (tosign) {
          data.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
          return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
        });
        bcapi.sendTX(data, function (err2, ret) {
          if (err2) {
            reject('signError');
          } else {
            if (ret && !ret.hasOwnProperty('error')) {
              const webhook2 = {
                'event': 'tx-confirmation',
                'address': addressTo.address,
                'url': `http://c2e8dfae.ngrok.io/api/trade/${addressTo.address}`,
                confirmations: 6
              };
              bcapi.createHook(webhook2, () => {
              });
              resolve(ret.tx.hash);
            } else {
              reject('sendError');
            }
          }
        });
      }
    });
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
