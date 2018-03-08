import MarketOrder from '../models/marketOrder';
import User from '../models/user';
import mongoose from 'mongoose';
import { orderTimeOut } from '../routes/socket_routes/chat_socket';
let orderTimers = {};

function updateUser(_id) {
  console.log('here');
  MarketOrder.find({ $or: [{ createUser: _id } , { userId: _id }, { stage: 'done' } , { stage: 'conflict' }] })
    .sort({ dateCreate: -1 })
    .limit(5)
    .exec((err, market) => {
      if (!err && market) {
        let timeBuy = 0;
        let timeSell = 0;
        market.map((m) => {
          // const bool1 = m.createUser === _id ? 1 : -1;
          // const bool2 = m.userId === _id ? 1 : -1;
          // const bool3 = m.type === 'buy' ? 1 : -1;
          const mode = m.createUser.toString() === _id.toString() ? 1 : -1;
          if (mode > 0) {
            const dateSecond = new Date(m.dateSecond);
            const dateThird = new Date(m.dateThird);
            timeBuy += Math.abs(dateThird.getTime() - dateSecond.getTime());
          } else {
            const dateDone = new Date(m.dateDone);
            const dateThird = new Date(m.dateThird);
            timeSell += Math.abs(dateDone.getTime() - dateThird.getTime());
          }
          timeBuy = timeBuy / market.length;
          timeSell = timeSell / market.length;
          const type = {
            buy: timeBuy > 180000 ? 'Người mua chậm' : 'Người mua nhanh',
            sell: timeBuy > 180000 ? 'Người bán chậm' : 'Người bán nhanh'
          };
          User.updateOne({ _id }, { type }).exec(() => {})
        })
      }
    })
}
function orderTimeUp(o) {
  MarketOrder.findOne({ _id: o._id }).exec((err, order) => {
    if (!err && order) {
      switch (order.stage) {
        case 'second': {
          MarketOrder.updateOne(
            { _id: order._id },
            { stage: 'open' }
          )
            .exec(() => {
              const message = {
                idFrom: order.userId._id,
                idTo: order.createUser._id,
                coin: order.coin,
              };
              updateUser(order.userId._id);
              updateUser(order.createUser._id);
              orderTimeOut(message);
            });
          break;
        }
        case 'third': {
          MarketOrder.updateOne(
            { _id: order._id },
            { stage: 'conflict' }
          ).exec(() => {
            const message = {
              idFrom: order.userId._id,
              idTo: order.createUser._id,
              coin: order.coin,
            };
            updateUser(order.userId._id);
            updateUser(order.createUser._id);
            orderTimeOut(message);
          });
          break;
        }
        default: {
          updateUser(order.userId._id);
          updateUser(order.createUser._id);
          break;
        }
      }
    }
  });
}
export function addOrder(order) {
  orderTimers[order._id] = setTimeout(orderTimeUp, 60000, order);
}
