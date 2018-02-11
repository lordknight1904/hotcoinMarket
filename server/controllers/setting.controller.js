import Setting from '../models/setting';

export function getSetting(req, res) {
  Setting.find({}).exec((err, settings) => {
    if (err) {
      res.json({ settings: [] });
    } else {
      res.json({ settings });
    }
  });
}
