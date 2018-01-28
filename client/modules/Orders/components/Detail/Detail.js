import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import homeStyles from '../../../Home/home.css';
import Chip from 'material-ui/Chip';
import {blue300, indigo900} from 'material-ui/styles/colors';
import { setTransaction } from '../../../Transaction/TransactionActions';
import numeral from 'numeral';
import { setNotify } from '../../../App/AppActions';
import { getUserName, getId, getRates, getCoin, getCoinList } from '../../../App/AppReducer';

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
  render() {
    const detail = this.props.detail;
    const typeBool = detail.type === 'buy';
    const userBool = detail.createUser._id.toString() === this.props.id.toString();
    const coin = this.props.coinList.filter((c) => { return c.name === detail.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;
    return (
      <div className={`col-md-12 col-xs-12 ${homeStyles.item} ${userBool ? homeStyles.itemBorderLeft : homeStyles.itemBorderRight}`}>
        <div className="row" style={{ display: 'flex' }}>
          <div className="col-md-10 col-xs-10">
            <div className="row">
              <div className="col-md-12  col-xs-12">
              <span style={{ color: '#3c763d', fontWeight: 'bold' }}>
                {userBool ? 'Nhận ' : 'Trả '}
              </span>
              <span style={{ color: '#3c763d', fontWeight: 'bold' }}>
                {numeral(detail.transferRate * last * (detail.amount / unit)).format('0,0')}&nbsp;
              </span>
              <span style={{ color: '#d9534f' }} >
                VNĐ&nbsp;
              </span>
              <span style={{ color: '#ced2bb' }}>
                qua Chuyển khoản&nbsp;
              </span>
              <span style={{ color: '#d9534f' }} >
                {detail.bank ? `${detail.bank.name} ` : ''}
              </span>
              {
                !userBool ? (
                  <span style={{ color: '#ced2bb' }}>
                    với nội dung chuyển khoản&nbsp;
                  </span>
                ) : ''
              }
              {
                !userBool ? (
                  <span style={{ color: '#d9534f' }} >
                    {detail.transferCode}
                  </span>
                ) : ''
              }
              </div>
              <div className="col-md-12 col-xs-12" >
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#ced2bb' }}>
                  Số lượng:&nbsp;
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ced2bb' }}>
                  {`${numeral(detail.amount).format('0,0.[000000]')} ${detail.coin} | `}
                </span>
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#ced2bb' }}>
                  Chưa đăng bằng chứng chuyển khoản
                </span>
              </div>
              <div className="col-md-12 col-xs-12">
              <span style={{ fontWeight: 'bold', color: '#ced2bb' }}>
                <i className="fa fa-user" />{`${userBool ? ' Bán cho ' : ' Mua từ '} ${detail.createUser ? detail.createUser.userName : ''}  `}
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
          <div className="col-md-2 col-xs-2" style={{ marginTop: '-5px', marginBottom: '-5px' }}>
            <div className="row" style={{ height: '100%' }}>
              <div className="col-md-12 col-xs-12" style={{ color: 'white', height: '50%', display: 'table', backgroundColor: 'green' }}>
                <span style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                Chi tiết
                </span>
              </div>
              <div className="col-md-12 col-xs-12" style={{ color: 'white', height: '50%', display: 'table', backgroundColor: 'red' }}>
                <span style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                  {
                    userBool ? (
                      'Đăng bằng chứng'
                    ) : 'Xem bằng chứng'
                  }
                </span>
              </div>
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
    id: getId(state),
    coinList: getCoinList(state),
  };
}
Detail.propTypes = {
  dispatch: PropTypes.func.isRequired,
  coinList: PropTypes.array.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  coin: PropTypes.string.isRequired,
  detail: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
};
Detail.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(Detail);
