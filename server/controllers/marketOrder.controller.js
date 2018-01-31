import User from '../models/user';
import Rate from '../models/rate';
import Setting from '../models/setting';
import MarketOrder from '../models/marketOrder';
import numeral from 'numeral';
import randomstring from 'randomstring';
import fs from 'fs-extra';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import cuid from 'cuid';
import { secondPhase, updateMarketOrders, thirdPhase, donePhase } from '../routes/socket_routes/chat_socket';
import * as btc from '../util/btc';

export function getLatestRate(req, res) {
  MarketOrder.find({  })
    .exec((err, market) => {
    if (err) {
      res.json({ latest: { coin: req.params.coin, rate: 1 } });
    } else {
      console.log(market);
      res.json({ latest: { coin: req.params.coin, rate: market[0].rate } });
    }
  })
}
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
                      const message = {
                        idFrom: response.userId._id,
                        idTo: response.createUser._id,
                        transaction: market,
                      };
                      thirdPhase(message);
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
  if (reqMarketOrder && reqMarketOrder.hasOwnProperty('id') && reqMarketOrder.hasOwnProperty('userId') ) {
    User.findOne({ _id: reqMarketOrder.userId }).exec((err, user) => {
      if (err) {
        res.json({ market: 'not ready' });
      } else {
        if (user) {
          MarketOrder
            .findOne({ _id: reqMarketOrder.id })
            .populate('createUser', 'addresses')
            .populate('userId', 'addresses')
            .exec((err2, market) => {
            if (err2) {
              res.json({ market: 'not ready' });
            } else {
              if (market) {
                if (market.stage === 'second') {
                  res.json({ market: 'Người mua chưa đăng bằng chứng chuyển khoản.' });
                  return;
                }
                if (market.stage === 'third') {
                  let api = {};
                  switch (market.coin) {
                    case 'BTC': {
                      api = btc;
                      break;
                    }
                    default:
                      res.json({ market: 'Sàn chưa hỗ trợ đồng này.'});
                      return;
                  }
                  Setting.find((errSetting, setting) => {
                    if (errSetting) {
                      return;
                    } else {
                      let feeNetwork = setting.filter(set => {return set.name === `feeNetwork${market.coin}`;});
                      let feeUsdt = setting.filter(set => {return set.name === 'feeUsdt'; });
                      let feeCoin = setting.filter(set => {return set.name === `feeCoin${market.coin}`;});
                      let addressCoin =  setting.filter(set => {return set.name === `addressCoin${market.coin}`;});

                      if (feeNetwork.length === 0) return;
                      if (feeUsdt.length === 0) return;
                      if (feeCoin.length === 0) return;
                      if (addressCoin.length === 0) return;
                      api.send(market, addressCoin, feeCoin, feeNetwork)
                        .catch((errSend) => {
                          res.json({ market: 'error' });
                        })
                        .then((ret) => {
                          MarketOrder.findOneAndUpdate(
                            { _id: reqMarketOrder.id },
                            { stage: 'done', txHash: ret.txHash, fee: ret.fee },
                            { new: true },
                          ).exec((err3, market2) => {
                            if (err3) {
                              res.json({ market: 'error' });
                            } else {
                              const message = {
                                idFrom: market.userId._id,
                                idTo: market.createUser._id,
                                coin: market.coin,
                              };
                              donePhase(message);
                              res.json({ market: market2 });
                            }
                          });
                        })
                    }
                  });
                }
              }
            }
          });
        } else {
          res.json({ market: 'not ready' });
        }
      }
    })
  }
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
          let unit = 0;
          switch (market.coin) {
            case 'BTC': {
              unit = 100000000;
              break;
            }
            case 'ETH': {
              unit = 1000000000000000000;
              break;
            }
          }
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
                      amount: numeral(reqMarketOrder.amount).value() * unit,
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
                      amount: numeral(reqMarketOrder.amount).value() * unit,
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
