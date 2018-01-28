import Bank from '../models/bank';

export function getBank(req, res) {
  Bank.find({}).exec((err, banks) => {
    if (err) {
      res.json({ banks: [] });
    } else {
      res.json({ banks });
    }
  })
}
