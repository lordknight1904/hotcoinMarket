import Rate from '../models/rate';

export function getRate(req, res) {
  Rate.findOne({ coin: req.params.coin }).exec((err, rate) => {
    if (err) {
      res.json({ rate: {} });
    } else {
      res.json({ rate });
    }
  })
}
