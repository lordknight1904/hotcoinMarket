import User from '../models/user';
import Setting from '../models/setting';

export function rankUser(market) {
  switch (market.stage) {
    case 'third': {
      console.log('third');
      rankThird(market);
      break;
    }
    case 'done': {
      rankDone(market);
      break;
    }
  }
}
function rankThird(market) {
  Setting.find({}).exec((errSetting, settings) => {
    console.log('ranking');
    if (!errSetting && settings.length > 0) {
      let rankThird = settings.filter(set => {return set.name === 'rankThird';});
      if (rankThird.length === 0) return;
      const dateSecond = new Date(market.dateSecond);
      const dateThird = new Date(market.dateThird);
      const rank = new Date(dateThird - dateSecond);
      console.log('woalala');
      console.log(rank);
      console.log(rank.getFullYear());
      console.log(rank.getMonth());
      console.log(rank.getDay());
      console.log(rank.getHours());
      console.log(rank.getMinutes());
      console.log(rank.getSeconds());
    }
  })
}
function rankDone(market) {

}
