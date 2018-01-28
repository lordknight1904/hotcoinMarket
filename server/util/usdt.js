import bcypher from 'blockcypher';

const usdt = new bcypher('bcy', 'test', '54f58bb28ee74b419188f503b0bf250f');

import bigi from 'bigi';

import bitcoin from 'bitcoinjs-lib';
import buffer from 'buffer';
import Order from '../models/order';
import Transaction from '../models/transaction';
import Deposit from '../models/deposit';
import mongoose from 'mongoose';
import numeral from 'numeral';

export function getHash(txHash) {
  return new Promise((resolve, reject) => {
    usdt.getTX(txHash, {},(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.confirmations);
      }
    });
  });
}
export function getHold(id) {
  return new Promise((resolve, reject) => {
    Order.find({ userId: id, type: 'buy', $or: [{ stage: 'open' }] }).exec((err, order) => {
      if (err) {
        reject(err);
      } else {
        let hold = 0;
        order.map((o) => {
          let unit = 0;
          switch (o.coin) {
            case 'BTC': {
              unit = 100000000;
              break;
            }
            case 'ETH': {
              unit = 1000000000000000000;
              break;
            }
          }
          hold += o.amountRemain / unit * o.price;
        });
        resolve(hold);
      }
    });
  });
}
export function getBalance(id) {
  return new Promise((resolve, reject) => {
    Deposit.find({ userId: mongoose.Types.ObjectId(id) }).exec((err, deposits) => {
      if (err) {
        resolve({ balance: 0 });
      } else {
        let balance = 0;
        let unit = 0;
        deposits.map((d) => {
          balance += numeral(d.value).value();
        });
        Transaction.find({ $or: [{ from: id }, { to: id }] }).exec((err, transactions) => {
          if (err) {
            resolve({ balance: 0 });
          } else {
            transactions.map((t) => {
              switch (t.coin) {
                case 'BTC': {
                  unit = 100000000;
                  break;
                }
                case 'ETH': {
                  unit = 1000000000000000000;
                  break;
                }
              }
              if (id.toString() === t.from.toString()) {
                balance += numeral(t.amount).value() / unit * numeral(t.price).value() - numeral(t.feeUsdt).value();
              } else {
                balance -= numeral(t.amount).value() / unit * numeral(t.price).value() - numeral(t.feeUsdt).value();
              }
            });
            resolve({ balance });
          }
        });
      }
    });
  });
}
export function transactionWithFee(userFrom, userTo, orderSell, orderBuy, addressFee, feeTrade, feeNetwork) {
  return new Promise((resolve, reject) => {
    let unit = 0;
    switch (orderSell.coin) {
      case 'BTC': {
        unit = 100000000;
        break;
      }
      case 'ETH': {
        unit = 1000000000000000000;
        break;
      }
      default: unit = 100000000;
    }
    const amountCoin = (orderSell.amountRemain <= orderBuy.amountRemain) ? orderSell.amountRemain : orderBuy.amountRemain;
    const amount = (amountCoin) / unit * 100000 * orderSell.price  - feeNetwork - feeTrade;
    const amountUsdt = (feeTrade)/ 1000 * orderSell.price;
    const af = userFrom.addresses.filter((a) => {
      return a.coin === 'USDT';
    });
    const at = userTo.addresses.filter((a) => {
      return a.coin === 'USDT';
    });
    const addressFrom = (af.length > 0) ? af[0] : [];
    const addressTo = (at.length > 0) ? at[0] : [];
    if (af.length === 0 || at.length === 0) reject('addressError');
    const newtx = {
      inputs: [{addresses: [addressFrom.address]}],
      outputs: [
        {addresses: [addressTo.address], value: Number(amount)},
        {addresses: [addressFee], value: Number(amountUsdt)}
      ],
      fees: Number(feeNetwork)
    };
    usdt.newTX(newtx, function (err, data) {
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
        usdt.sendTX(data, function (err2, ret) {
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
              usdt.createHook(webhook2, () => {
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
