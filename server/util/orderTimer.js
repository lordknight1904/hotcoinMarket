import MarketOrder from '../models/marketOrder';
import { orderTimeOut } from '../routes/socket_routes/chat_socket';
let orderTimers = {};

function orderTimeUp(order) {
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
        orderTimeOut(message);
      });
      break;
    }
    default: break;
  }
}
export function addOrder(order) {
  orderTimers[order._id] = setTimeout(orderTimeUp, 10000, order);
}
