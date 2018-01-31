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
import detailStyles from '../../ordersStyles.css';
import { marketThird, marketDone } from '../../../Orders/OrderActions';

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
      time: {},
      start: new Date(),
      isSubmitting: false,
    };
  }

  componentDidMount() {
    this.setState({ time: new Date() });
    this.timer = setInterval(this.tick, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  tick = () => {
    this.setState({ time: new Date() });
  };
  onUpload = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    let base64image = null;
    const reader = new FileReader();
    reader.onload = (readerEvt) => {
      base64image = readerEvt.target.result;
    };
    reader.readAsDataURL(file);
    reader.onloadend = (base64image) => {
      const market = {
        id: this.props.detail._id,
        userId: this.props.id,
        imageBase64: base64image.target.result,
      };
      this.props.dispatch(marketThird(market)).then((res) => {
        console.log(res);
      });
    };
  };
  onPay = () => {
    if (this.state.isSubmitting) {
      this.props.dispatch(setNotify('Lệnh đang được xử lý'));
      return;
    }
    const market = {
      id: this.props.detail._id,
      userId: this.props.id,
    };
    this.setState({ isSubmitting: true });
    this.props.dispatch(marketDone(market)).then((res) => {
      this.setState({ isSubmitting: false });
      console.log(res);
    })
  };
  render() {
    const detail = this.props.detail;
    const typeBool = detail.type === 'buy';
    const userBool = detail.createUser._id.toString() === this.props.id.toString();
    const bool = (userBool ? 1 : -1) * (typeBool ? 1 : -1);
    const coin = this.props.coinList.filter((c) => { return c.name === detail.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;

    const time = this.state.time;

    const start = new Date(detail.dateSecond);
    const timeLeft = new Date(start - time);
    timeLeft.setHours(timeLeft.getHours() - 7);
    timeLeft.setMinutes(timeLeft.getMinutes() + 15);
    const hours =  timeLeft.getHours() < 10 ? `0${timeLeft.getHours()}` : timeLeft.getHours();
    const minutes =  timeLeft.getMinutes() < 10 ? `0${timeLeft.getMinutes()}` : timeLeft.getMinutes();
    const seconds =  timeLeft.getSeconds() < 10 ? `0${timeLeft.getSeconds()}` : timeLeft.getSeconds();

    const timeStr = `${hours}:${minutes}:${seconds}`;
    return (
      <div className={`col-md-12 col-xs-12 ${homeStyles.item} ${userBool ? homeStyles.itemBorderLeft : homeStyles.itemBorderRight}`}>
        <div className="row" style={{ display: 'flex' }}>
          <div className="col-md-1 col-xs-1">
            <div className="row" style={{ height: '100%' }}>
              <div className="col-md-12 col-xs-12" style={{ display: 'table', height: '100%' }}>
                <span style={{ color: '#d9534f', fontSize: '14px', display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
                  {timeStr}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-9 col-xs-9">
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
                  {
                    (detail.hasOwnProperty('evidenceDir') && detail.evidenceDir !== '') ? (
                      'Đã đăng bằng chứng chuyển khoản'
                    ) : 'Chưa đăng bằng chứng chuyển khoản'
                  }
                </span>
              </div>
              <div className="col-md-12 col-xs-12">
              <span style={{ fontWeight: 'bold', color: '#ced2bb' }}>
                <i className="fa fa-user" />
                {`
                ${(bool > 0) ? ' Bán cho ' : ' Mua từ '}
                ${(bool > 0) ? (detail.userId ? detail.userId.userName : '') : (detail.createUser ? detail.createUser.userName : '')}
                `}
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
                <span style={{ display: 'table-cell', verticalAlign: 'middle' }} onClick={() => this.props.openDetail(detail)}>
                Chi tiết
                </span>
              </div>
              <div className="col-md-12 col-xs-12" style={{ color: 'white', height: '50%', backgroundColor: 'red', paddingLeft: '0', paddingRight: '0' }}>
                <span>
                  {
                    (bool > 0) ? (
                      <div style={{ height: '100%' }}>
                        <label className={detailStyles.uploadLabel} htmlFor="file-upload" style={{ height: '100%', width: '100%', marginBottom: '0', display: 'table' }}>
                          <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '10px' }}>
                            <i className="fa fa-cloud-upload" style={{ color: '#white' }} />
                            <span>&nbsp;Đăng bằng chứng</span>
                          </div>
                        </label>
                        <input id="file-upload" accept="image/jpeg, image/png" type="file" style={{ display: 'none' }} onChange={this.onUpload} />
                      </div>
                    ) : (
                      <div style={{ height: '100%' }}>
                        <label className={detailStyles.uploadLabel} style={{ height: '100%', width: '100%', marginBottom: '0', display: 'table' }} onClick={this.onPay}>
                          <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '10px' }}>
                            <span>Đã nhận chuyển khoản</span>
                          </div>
                        </label>
                      </div>
                    )
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
  openDetail: PropTypes.func.isRequired,
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
