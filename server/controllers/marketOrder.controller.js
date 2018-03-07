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
import * as rank from '../util/rank';
import * as OrderTimer from '../util/orderTimer';

export function getLatestRate(req, res) {
  MarketOrder.aggregate([
    {
      $match: {
        stage: 'done',
        coin: req.params.coin
      }
    },
    { $sort : { dateDone : -1 } },
    {
      $group: {
        _id: '$type',
        min: { $first: "$rate" },
        max: { $first: "$rate" }
      }
    }
    ]).exec((err, market) => {
      if (err) {
        res.json({ latest: { coin: req.params.coin, min: 22675, max: 22675 } });
      } else {
        const sellArr = market.filter((m) => { return m._id === 'sell'});
        const buyArr = market.filter((m) => { return m._id === 'buy'});
        const min =  sellArr.length > 0 ? sellArr[0].min : 22675;
        const max =  buyArr.length > 0 ? buyArr[0].max : 22675;
        res.json({ latest: { coin: req.params.coin, min, max } });
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
                  dateThird: Date.now(),
                },
                { new: true }
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
                      rank.rankUser(market);
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
                      let minimumFeeCoin = setting.filter(set => {return set.name === `minimumFee${market.coin.toUpperCase()}`;});
                      let addressCoin =  setting.filter(set => {return set.name === `addressCoin${market.coin}`;});

                      if (feeNetwork.length === 0) return;
                      if (minimumFeeCoin.length === 0) return;
                      if (feeUsdt.length === 0) return;
                      if (feeCoin.length === 0) return;
                      if (addressCoin.length === 0) return;
                      api.send(market, addressCoin[0].value, feeCoin, minimumFeeCoin[0].value, feeNetwork)
                        .catch((errSend) => {
                          res.json({ market: 'error' });
                        })
                        .then((ret) => {
                          MarketOrder.findOneAndUpdate(
                            { _id: reqMarketOrder.id },
                            { stage: 'done', txHash: ret.txHash, txHashFee: ret.txHashFee, feeNetwork: ret.feeNetwork, feeTrade: ret.feeTrade, feeTradeAdmin: ret.feeTradeAdmin, dateDone: Date.now() },
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
              } else {
                res.json({ market: 'market not exist' });
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
    Setting.find({}).exec((errSetting, setting) => {
      if (errSetting) {
        res.json({ market: 'error' });
      } else {
        if (setting.length > 0) {
          const feeArr = setting.filter((s) => {return s.name === 'feeCoin';});
          if (feeArr.length === 0) {
            res.json({ market: 'error' });
            return;
          }
          MarketOrder.findOne({ _id: reqMarketOrder.id, stage: 'open' }).exec((err, market) => {
            if (err) {
              res.json({ market: 'not ready' });
            } else {
              if (market) {
                let unit = 0;
                let api = {};
                switch (market.coin) {
                  case 'BTC': {
                    unit = 100000000;
                    api = btc;
                    break;
                  }
                  case 'ETH': {
                    unit = 1000000000000000000;
                    // api = eth;
                    break;
                  }
                }
                if (reqMarketOrder.amount * unit < market.min || reqMarketOrder.amount * unit > market.max) {
                  res.json({ market: 'Số lượng không phù hợp' });
                  return;
                }
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
                            amount: numeral(reqMarketOrder.amount).value() * unit,
                            dateSecond: Date.now(),
                            transferCode: `${prefix}${subfix}`,
                            transferRate: rate.last,
                            fee: numeral(feeArr[0].value).value(),
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
                              OrderTimer.addOrder(market2);
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
                        User.findOne({ _id: reqMarketOrder.userId }).exec((errUser, user) => {
                          if (errUser) {
                            res.json({ market: 'error' });
                          } else {
                            const address = user.addresses.filter((a) => {
                              return a.coin === market.coin;
                            });
                            if (address.length === 0) {
                              res.json({ market: 'error' });
                              return;
                            }
                            api.getAddress(address[0].address)
                              .catch(() => {
                                res.json({ market: 'Không thể đặt lệnh' });
                              })
                              .then((data) => {
                                api.getHold(user._id)
                                  .catch(() => {
                                    res.json({ market: 'error' });
                                  })
                                  .then((hold) => {
                                    if (data.balance >= hold + numeral(reqMarketOrder.amount).value() * unit) {
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
                                          fee: numeral(feeArr[0].value).value(),
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
                                            OrderTimer.addOrder(market2);
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
                                      res.json({ market: `Không đủ ${reqMarketOrder.coin}` });
                                    }
                                  });
                              });
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
          res.json({ market: 'error' });
        }
      }
    });
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
    let api = {};
    let unit = 0;
    switch (reqMarketOrder.coin) {
      case 'BTC': {
        unit = 100000000;
        api = btc;
        break;
      }
      default:
        res.json({ market: 'Sàn chưa hỗ trợ đồng này.'});
        return;
    }
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
      min: reqMarketOrder.min * unit,
      max: reqMarketOrder.max * unit,
      accountNumber: (reqMarketOrder.type === 'sell') ? reqMarketOrder.accountNumber : '',
      accountName: (reqMarketOrder.type === 'sell') ? reqMarketOrder.accountName : '',
      coin: reqMarketOrder.coin,
    });
    if (reqMarketOrder.type === 'sell') {
      User.findOne({ _id: reqMarketOrder.createUser }).exec((err, user) => {
        if (err) {
          res.json({ market: 'error' });
        } else {
          if (user) {
            const address = user.addresses.filter((a) => {
              return a.coin === reqMarketOrder.coin;
            });
            api.getAddress(address[0].address)
              .catch(() => {
                res.json({ market: 'Không thể đặt lệnh' });
              })
              .then((data) => {
              api.getHold(user._id)
                .catch(() => {
                  res.json({order: 'Không thể đặt lệnh'});
                })
                .then((hold) => {
                  if (data.balance >= hold + Number(reqMarketOrder.max) * unit) {
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
                    res.json({ market: `Không đủ ${reqMarketOrder.coin}` });
                  }
                });
            });
          } else {
            res.json({ market: 'error' });
          }
        }
      });
    } else {
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
    }
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
  const max = req.query.max ? numeral(req.query.max).value() : 0;
  MarketOrder
    .find(
      { coin: req.params.coin, type: req.params.type, stage: 'open', max: { $gte : max } },
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
          .populate('createUser', 'userName addresses.address')
          .populate('userId', 'userName addresses.address')
          .populate('bank', 'name')
          .exec((err2, market) => {
            if (err2) {
              res.json({ market: [] });
            } else {
              // let response = market;
              // response = response.map((r) => {
              //   console.log(r.userId);
              //   const address = r.userId.addresses.filter((add) => { return add.coin === req.params.coin; })[0];
              //   if (!address) return;
              //   r.userId.addresses = {
              //     coin: market.coin,
              //     address: address.address,
              //   };
              //   return r;
              // });
              res.json({ market });
            }
          });
      } else {
        res.json({ market: [] });
      }
    }
  });
}

export function send(req, res) {
  const reqSend = req.body.send;
  if (reqSend &&
    reqSend.hasOwnProperty('id') &&
    reqSend.hasOwnProperty('address') &&
    reqSend.hasOwnProperty('amount') &&
    reqSend.hasOwnProperty('coin')
  ) {
    User.findOne({ _id: reqSend.id }).exec((err, user) => {
      if (err) {
        res.json({ market: 'error' });
      } else {
        if (user) {
          const address = user.addresses.filter(add => {return add.coin === reqSend.coin;} );
          switch (reqSend.coin) {
            case 'BTC': {
              let bool = true;
              btc.directTransfer(address[0].address, address[0].private, reqSend.address, Number(reqSend.amount)).catch((errors) => {
                bool = false;
                res.json({ market: 'error' });
                return;
              }).then((data) => {
                if (bool) {
                  const directHistory = {
                    txHash: data,
                    coin: reqSend.coin,
                  };
                  User.findOneAndUpdate(
                    {_id: reqSend.id},
                    {$push: {directHistory}},
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                  ).exec((err2) => {
                    if (err2) {
                      res.json({market: 'missing'});
                    } else {
                      res.json({market: 'success'});
                    }
                  });
                }
              });
              break;
            }
            case 'ETH': {

              break;
            }
            default: {
              res.json({ market: 'missing' });
            }
          }
        } else {
          res.json({ market: 'not found' });
        }
      }
    });
  } else {
    res.json({ market: 'missing' });
  }
}
export function getHistory(req, res) {
  User.findOne({ userName: req.params.userName }).exec((err, user) => {
    if (err) {
      res.json({ history: [] });
    } else {
      if (user) {
        MarketOrder
          .find({ coin: req.params.coin })
          .skip(20 * req.params.currentPage)
          .limit(20)
          .populate('createUser', 'userName')
          .populate('userId', 'userName addresses')
          .populate('bank', 'name')
          .exec((err, history) => {
            if (err) {
              res.json({ history: [] });
            } else {
              res.json({ history });
            }
          })
      } else {
        res.json({ history: [] });
      }
    }
  });
}
//
// export function fee(req, res) {
//   const reqMarket = req.body.market;
//   if (reqMarket &&
//     reqMarket.hasOwnProperty('id') &&
//     reqMarket.hasOwnProperty('coin')
//   ) {
//     let api = {};
//     switch (reqMarket.coin) {
//       case 'BTC': {
//         api = btc;
//         break;
//       }
//       default:
//         res.json({ market: 'Sàn chưa hỗ trợ đồng này.'});
//         return;
//     }
//     User.findOne({ _id: reqMarket.userId }).exec((err, user) => {
//       if (err) {
//         res.json({ fee: 0 });
//       } else {
//         if (user) {
//           MarketOrder.findOne({ _id: reqMarket.id }).exec((errMarket, market) => {
//             if (errMarket) {
//               res.json({ fee: 0 });
//             } else {
//               if (market) {
//
//                 const address1 = market.userId.addresses.filter((add) => {
//                   return add.coin === market.coin;
//                 })[0];
//                 User.
//                 const micro = {
//                   from_pubkey: addressFrom.public,
//                   to_address: addressTo.address,
//                   value_satoshis: reqMarket.amount,
//                 };
//                 api.createMicro(micro, (err, data) => {
//                   if (err) {
//                     res.json({ fee: 0 });
//                   } else {
//                     res.json({ fee: data.fee });
//                   }
//                 })
//               } else {
//                 res.json({ fee: 0 });
//               }
//             }
//           })
//         } else {
//           res.json({ fee: 0 });
//         }
//       }
//     });
//   }
// }
