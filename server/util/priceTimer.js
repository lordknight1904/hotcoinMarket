import Rate from '../models/rate';
import Bitstamp from 'bitstamp';
import { updateRate } from '../routes/socket_routes/chat_socket';

const bitstamp = new Bitstamp();
export function getPrice(coin) {
  bitstamp.ticker(`${coin.toLowerCase()}usd`, (err, rate) => {
    if (!err) {
      Rate.findOneAndUpdate(
        { coin: coin.toUpperCase() },
        {
          last: rate.last,
          high: rate.high,
          low: rate.low,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .exec(() => {
          const newRate = {
            code: 'updateRate',
            coin: coin.toUpperCase(),
            last: rate.last,
            high: rate.high,
            low: rate.low,
          };
          updateRate(newRate);
      })
    }
  });
}
