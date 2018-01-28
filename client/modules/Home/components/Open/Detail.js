import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import homeStyles from '../../home.css';
import Chip from 'material-ui/Chip';
import {blue300, indigo900} from 'material-ui/styles/colors';
import numeral from 'numeral';
import { setNotify } from '../../../App/AppActions';
import { getUserName, getId, getRates, getCoin } from '../../../App/AppReducer';
import { deleteMarketOrder, getMyBuyMarket, getMySellMarket } from '../../HomeActions';

class Buy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  onDelete = (marketId) => {
    const market = {
      createUser: this.props.id,
      marketId
    };
    this.props.dispatch(deleteMarketOrder(market)).then(() => {
      this.props.dispatch(getMyBuyMarket(this.props.coin, this.props.userName));
      this.props.dispatch(getMySellMarket(this.props.coin, this.props.userName));
    });
  };
  render() {
    const bool = this.props.type === 'buy';
    const detail = this.props.detail;
    const date = new Date(detail.dateCreated);
    const hours =  date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes =  date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const time = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${hours}:${minutes}`;
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;
    return (
      <div className={`col-md-12 col-xs-12 ${homeStyles.item} ${bool ? homeStyles.itemBorderLeft : homeStyles.itemBorderRight}`}>
        <div className="col-md-10 col-xs-10">
          <div className="row">
            <div className="col-md-12 col-xs-12">
              <span style={{ color: '#3c763d', fontWeight: 'bold' }}>
                {numeral(detail.rate * last).format('0,0')}&nbsp;
              </span>
              <span style={{ color: '#d9534f' }}>
                {`VNĐ/${detail.coin} `}
              </span>
              <span style={{ color: '#ced2bb' }}>
                qua Chuyển khoản&nbsp;
              </span>
              <span style={{ color: '#d9534f' }} >
                {detail.bank ? detail.bank.name : ''}
              </span>
            </div>
            <div className="col-md-12 col-xs-12" >
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#ced2bb' }}>
                Trong khoản:&nbsp;
              </span>
              <span style={{ fontWeight: 'bold', color: '#ced2bb' }}>
                {`${detail.min} - ${detail.max} ${detail.coin}`}
              </span>
            </div>
            <div className="col-md-12 col-xs-12">
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#ced2bb' }}>
                {`Ngày đặt: ${time}`}
                Ngày đặt:&nbsp;
              </span>
              <span style={{ fontWeight: 'bold', color: '#ced2bb' }}>
                 22/10/2017
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-xs-2">
          <Button onClick={() => this.onDelete(detail._id)}>Hủy</Button>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    userName: getUserName(state),
    id: getId(state),
    rates: getRates(state),
    coin: getCoin(state),
  };
}
Buy.propTypes = {
  dispatch: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  detail: PropTypes.object.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
};
Buy.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(Buy);
