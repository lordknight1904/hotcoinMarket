import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import homeStyles from '../../home.css';
import Chip from 'material-ui/Chip';
import {blue300, indigo900} from 'material-ui/styles/colors';
import { setTransaction } from '../../../Transaction/TransactionActions';
import numeral from 'numeral';
import { setNotify } from '../../../App/AppActions';
import { getUserName, getId, getRates, getCoin, getCoinList } from '../../../App/AppReducer';
import { marketFirst } from '../../HomeActions';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'inline-block',
  },
  label: {
    lineHeight: '22px',
    paddingLeft: '8px',
    paddingRight: '8px',
  }
};
class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  onClick = () => {
    const detail = this.props.detail;
    if (this.props.id === '') {
      this.props.dispatch(setNotify('Đăng nhập/Đăng ký để thực hiện giao dịch'));
      return;
    }
    if (detail.createUser.userName === this.props.userName) {
      this.props.dispatch(setNotify('Không thể thực hiện giao dịch với chính bạn.'));
      return;
    }
    const market = {
      id: detail._id,
    };
    this.props.dispatch(marketFirst(market)).then((res) => {
      if (res.market === 'not ready') {
        this.props.dispatch(setNotify('Không thể giao dịch với lệnh này.'))
      } else {
        this.props.dispatch(setTransaction(res.market));
        this.context.router.push('/transaction');
      }
    });
  };
// <Button
// style={{
//   backgroundColor: bool ? '#ff6939' : 'rgb(51, 199, 23)',
//   borderColor: 'transparent'
// }}
// bsSize="large"
// onClick={this.onClick}
// >
// {bool ? 'Bán' : 'Mua'}
// </Button>
  render() {
    const bool = this.props.type === 'buy';
    const detail = this.props.detail;
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;

    const coin = this.props.coinList.filter((c) => { return c.name === this.props.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    return (
      <div className={`col-md-12 col-xs-12 ${homeStyles.item} ${bool ? homeStyles.itemBorderLeft : homeStyles.itemBorderRight}`}>
        <div className="col-md-10 col-xs-10">
          <div className="row">
            <div className="col-md-12  col-xs-12">
              <span style={{ color: '#3c763d', fontWeight: 'bold' }}>
                {numeral(detail.rate * last).format('0,0')}&nbsp;
              </span>
              <span style={{ color: '#d9534f' }} >
                VNĐ/BTC&nbsp;
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
                Tối đa:&nbsp;
              </span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ced2bb' }}>
                {`${numeral(numeral(detail.max).value() / unit).format('0,0.[000000]')} ${detail.coin}`}
              </span>
            </div>
            <div className="col-md-12 col-xs-12">
              <span style={{ fontWeight: 'bold', color: '#ced2bb' }}>
                <i className="fa fa-user" />{` ${detail.createUser ? detail.createUser.userName : ''}  `}
              </span>
              <span style={styles.wrapper}>
                <Chip
                  backgroundColor={blue300}
                  labelStyle={styles.label}
                >
                  người mua nhanh
                </Chip>
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-xs-2">
          <div className="row" style={{ height: '100%' }}>
            <div
              className={homeStyles.customButtonStyles}
              onClick={this.onClick}
              style={{
                backgroundColor: bool ? '#ff6939' : 'rgb(51, 199, 23)',
              }}
            >
              <span
                style={{
                  display: 'table-cell',
                  color: '#333',
                  fontSize: '18px',
                  verticalAlign: 'middle',
                }}
              >
                {bool ? 'Bán' : 'Mua'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    userName: getUserName(state),
    rates: getRates(state),
    coin: getCoin(state),
    coinList: getCoinList(state),
    id: getId(state),
  };
}
Detail.propTypes = {
  dispatch: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  coin: PropTypes.string.isRequired,
  detail: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
  coinList: PropTypes.array.isRequired,
};
Detail.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(Detail);
