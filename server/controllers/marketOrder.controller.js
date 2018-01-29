import User from '../models/user';
import Rate from '../models/rate';
import MarketOrder from '../models/marketOrder';
import numeral from 'numeral';
import randomstring from 'randomstring';
import fs from 'fs-extra';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import cuid from 'cuid';
import { secondPhase, updateMarketOrders } from '../routes/socket_routes/chat_socket';

function writeImage(base64image) {
  return new Promise((resolve, reject) => {
    const ext = base64image.split(';')[0].match(/jpeg|png|gif/)[0];
    const data = base64image.replace(/^data:image\/\w+;base64,/, '');
    const buf = new Buffer(data, 'base64');
    const date = Date.now();
    const srcImageName = `${date.toString()}_${cuid()}`;
    fs.writeFile(`public/${srcImageName}.${ext}`, buf)
      .then(() => {
        imagemin([`public/${srcImageName}.${ext}`], './public', {
          plugins: [
            imageminJpegtran(),
            imageminPngquant({ quality: '70-80' }),
          ],
        })
          .then(files => {
            const imageName = `${date.toString()}_${cuid()}`;
            fs.writeFile(`public/${imageName}.${ext}`, files[0].data)
              .then(() => {
                fs.unlink(`public/${srcImageName}.${ext}`)
                  .then(() => {
                    resolve(`${imageName}.${ext}`);
                  })
                  .catch((error3) => {
                    reject(error3);
                  })
              })
              .catch((error2) => {
                reject(error2);
              });
          })
          .catch((errorImagemin) => {
            reject(errorImagemin);
          })
      })
      .catch((error1) => {
        reject(error1);
      });
  });
}
export function third(req, res) {
  const reqMarketOrder = req.body.market;
  if (reqMarketOrder &&
      reqMarketOrder.hasOwnProperty('userId') &&
      reqMarketOrder.hasOwnProperty('id') &&
      reqMarketOrder.hasOwnProperty('imageBase64')
  ) {
    User.findOne({ _id: reqMarketOrder.userId }).exec((err, user) => {
      if (err) {
        res.json({ market: 'error' });
      } else {
        if (!user) {
          res.json({ market: 'error' });
        } else {
          writeImage(reqMarketOrder.imageBase64)
            .then((ret) => {
              MarketOrder.findOneAndUpdate(
                {
                  _id: reqMarketOrder.id,
                  stage: 'second',
                },
                {
                  stage: 'third',
                  evidenceDir: ret,
                },
                {new: true}
              )
                .populate('createUser', 'userName')
                .populate('userId', 'userName addresses')
                .populate('bank', 'name')
                .exec((err2, market) => {
                  if (err2) {
                    res.json({ market: 'not ready' });
                  } else {
                    if (market) {
                      let response = market;
                      const address = response.userId.addresses.filter((add) => {
                        return add.coin === market.coin;
                      })[0];
                      response.userId.addresses = {
                        coin: market.coin,
                        address: address.address,
                      };
                      res.json({market: response});
                    } else {
                      res.json({ market: 'not ready' });
                    }
                  }
                });
            })
            .catch((reject) => {
              res.json({ market: 'error' });
            })
        }
      }
    });
  } else {
    res.json({ market: 'missing' });
  }
}
export function done(req, res) {
  const reqMarketOrder = req.body.market;
}
export function first(req, res) {
  const reqMarketOrder = req.body.market;
  if (reqMarketOrder && reqMarketOrder.hasOwnProperty('id') ) {
    MarketOrder
      .findOne({ _id: reqMarketOrder.id, stage: 'open' })
      .populate('createUser', 'userName')
      .populate('bank', 'name')
      .exec((err, market) => {
      if (err) {
        res.json({ market: 'not ready' });
      } else {
        if (market) {
          res.json({ market });
        }
      }
    })
  } else {
    res.json({ market: 'not ready' });
  }
}
export function second(req, res) {
  const reqMarketOrder = req.body.market;
  if (reqMarketOrder &&
    reqMarketOrder.hasOwnProperty('id') &&
    reqMarketOrder.hasOwnProperty('amount') &&
    reqMarketOrder.hasOwnProperty('userId')
  ) {
    MarketOrder.findOne({ _id: reqMarketOrder.id, stage: 'open' }).exec((err, market) => {
      if (err) {
        res.json({ market: 'not ready' });
      } else {
        if (market) {
          const message = {
            coin: market.coin,
            idFrom: market.createUser,
            idTo: reqMarketOrder.userId,
          };
          const prefix = randomstring.generate({
            length: 3,
            charset: 'alphabetic',
            capitalization: 'uppercase'
          });
          const subfix = randomstring.generate({
            length: 5,
            charset: 'numeric'
          });
          Rate.findOne({ coin: market.coin }).exec((err3, rate) => {
            if (err3) {
              res.json({ market: 'not ready' });
            } else {
              if (rate) {
                if (market.type === 'sell'){
                  MarketOrder.findOneAndUpdate(
                    {
                      _id: reqMarketOrder.id,
                      stage: 'open',
                    },
                    {
                      stage: 'second',
                      userId: reqMarketOrder.userId,
                      amount: numeral(reqMarketOrder.amount).value(),
                      dateSecond: Date.now(),
                      transferCode: `${prefix}${subfix}`,
                      transferRate: rate.last
                    },
                    {new: true}
                  )
                    .populate('createUser', 'userName')
                    .populate('userId', 'userName addresses')
                    .populate('bank', 'name')
                    .exec((err2, market2) => {
                      if (err2) {
                        res.json({market: 'not ready'});
                      } else {
                        secondPhase(message);
                        let response = market2;
                        const address = response.userId.addresses.filter((add) => {
                          return add.coin === market.coin;
                        })[0];
                        response.userId.addresses = {
                          coin: market.coin,
                          address: address.address,
                        };
                        res.json({market: response});
                      }
                    });
                } else {
                  MarketOrder.findOneAndUpdate(
                    {
                      _id: reqMarketOrder.id,
                      stage: 'open',
                    },
                    {
                      stage: 'second',
                      userId: reqMarketOrder.userId,
                      amount: numeral(reqMarketOrder.amount).value(),
                      dateSecond: Date.now(),
                      transferCode: `${prefix}${subfix}`,
                      transferRate: rate.last,
                      accountNumber: reqMarketOrder.accountNumber,
                      accountName: reqMarketOrder.accountName,
                    },
                    {new: true}
                  )
                    .populate('createUser', 'userName')
                    .populate('userId', 'userName addresses')
                    .populate('bank', 'name')
                    .exec((err2, market2) => {
                      if (err2) {
                        res.json({market: 'not ready'});
                      } else {
                        secondPhase(message);
                        let response = market2;
                        const address = response.userId.addresses.filter((add) => {
                          return add.coin === market.coin;
                        })[0];
                        response.userId.addresses = {
                          coin: market.coin,
                          address: address.address,
                        };
                        res.json({market: response});
                      }
                    });
                }
              } else {
                res.json({ market: 'not ready' });
              }
            }
          });
        } else {
          res.json({ market: 'not ready' });
        }
      }
    })
  } else {
    res.json({ market: 'not ready' });
  }
}
export function createMarketOrder(req, res) {
  const reqMarketOrder = req.body.market;
  if (reqMarketOrder &&
    reqMarketOrder.hasOwnProperty('createUser') &&
    reqMarketOrder.hasOwnProperty('type') &&
    reqMarketOrder.hasOwnProperty('rate') &&
    reqMarketOrder.hasOwnProperty('bank') &&
    reqMarketOrder.hasOwnProperty('min') &&
    reqMarketOrder.hasOwnProperty('max') &&
    reqMarketOrder.hasOwnProperty('coin')
  ) {
    if (reqMarketOrder.type === 'sell') {
      if (!reqMarketOrder.hasOwnProperty('accountNumber') && !reqMarketOrder.hasOwnProperty('accountName')) {
        res.json({ market: 'error' });
        return;
      }
    }
    const market = new MarketOrder({
      createUser: reqMarketOrder.createUser,
      type: reqMarketOrder.type,
      rate: reqMarketOrder.rate,
      bank: reqMarketOrder.bank,
      min: reqMarketOrder.min,
      max: reqMarketOrder.max,
      accountNumber: (reqMarketOrder.type === 'sell') ? reqMarketOrder.accountNumber : '',
      accountName: (reqMarketOrder.type === 'sell') ? reqMarketOrder.accountName : '',
      coin: reqMarketOrder.coin,
    });
    market.save((err) => {
      if (err) {
        res.json({ market: 'error' });
      } else {
        const message = {
          coin: reqMarketOrder.coin,
        };
        updateMarketOrders(message);
        res.json({ market: 'success' });
      }
    });
  } else {
    res.json({ market: 'missing inputs' });
  }
}
export function deleteOrder(req, res) {
  const reqMarketOrder = req.body.market;
  if (reqMarketOrder &&
    reqMarketOrder.hasOwnProperty('createUser') &&
    reqMarketOrder.hasOwnProperty('marketId')
  ) {
    User.findOne({ _id: reqMarketOrder.createUser }).exec((err, user) => {
      if (err) {
        res.json({ market: 'error' });
      } else {
        if (user) {
          MarketOrder.findOneAndRemove({ _id: reqMarketOrder.marketId }).exec((err3) => {
            if (err3) {
              res.json({ market: 'error' });
            } else {
              res.json({ market: 'success' });
            }
          })
        } else {
          res.json({ market: 'error' });
        }
      }
    });
  }
}
export function getMarket(req, res) {
  MarketOrder
    .find(
      { coin: req.params.coin, type: req.params.type, stage: 'open' },
      {},
      {
        limit: 20,
        sort: {
          rate: (req.params.type === 'sell') ? -1 : 1
        }
      })
    .populate('createUser', 'userName')
    .populate('bank', 'name')
    .exec((err, market) => {
    if (err) {
      res.json({ market: [] });
    } else {
      res.json({ market });
    }
  });
}
export function getMyMarket(req, res) {
  User.findOne({ userName: req.params.userName }).exec((err, user) => {
    if (err) {
      res.json({ market: [] });
    } else {
      if (user) {
        MarketOrder
          .find({ createUser: user._id, type: req.params.type, coin: req.params.coin, stage: 'open' })
          .populate('createUser', 'userName')
          .populate('bank', 'name')
          .exec((err2, market) => {
            if (err2) {
              res.json({market: []});
            } else {
              res.json({market});
            }
          });
      } else {
        res.json({ market: [] });
      }
    }
  });
}
export function getMyTradingMarket(req, res) {
  User.findOne({ userName: req.params.userName }).exec((err, user) => {
    if (err) {
      res.json({ market: [] });
    } else {
      if (user) {
        MarketOrder
          .find({
            $and: [
              { $or: [{ stage: 'second' }, { stage: 'third' }] },
              { $or: [{ createUser: user._id }, { userId: user._id }] },
            ],
            coin: req.params.coin,
          })
          .populate('createUser', 'userName')
          .populate('userId', 'userName addresses')
          .populate('bank', 'name')
          .exec((err2, market) => {
            if (err2) {
              res.json({ market: [] });
            } else {
              let response = market;
              response = response.map((r) => {
                const address = r.userId.addresses.filter((add) => { return add.coin === req.params.coin; })[0];
                r.userId.addresses = {
                  coin: market.coin,
                  address: address.address,
                };
                return r;
              });
              res.json({ market: response });
            }
          });
      } else {
        res.json({ market: [] });
      }
    }
  });
}
