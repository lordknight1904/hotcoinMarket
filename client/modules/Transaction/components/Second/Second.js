import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import tStyles from '../../transaction.css';
import { getTransaction } from '../../TransactionReducer';
import numeral from 'numeral';
import { marketDone, marketThird } from "../../../Orders/OrderActions";
import { getCoinList, getId, getRates, getSettings } from '../../../App/AppReducer';
import { setNotify } from "../../../App/AppActions";

class Second extends Component {
  constructor(props){
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
        id: this.props.transaction._id,
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
      id: this.props.transaction._id,
      userId: this.props.id,
    };
    this.setState({ isSubmitting: true });
    this.props.dispatch(marketDone(market)).then((res) => {
      this.setState({ isSubmitting: false });
      if (res.market === 'Người mua chưa đăng bằng chứng chuyển khoản.') {
        this.props.dispatch(setNotify(res.market));
        return;
      }
      this.props.dispatch(setNotify('Giao dịch đã hoàn thành'));
      this.props.handleNext();
    })
  };
  render() {
    const t = this.props.transaction;
    if (!t.hasOwnProperty('type')) return <div></div>;
    const typeBool = t.type === 'buy';
    const userBool = t.createUser._id.toString() === this.props.id.toString();
    const bool = (userBool ? 1 : -1) * (typeBool ? 1 : -1);
    const time = this.state.time;

    const start = new Date(t.dateSecond);
    const timeLeft = new Date(start - time);
    timeLeft.setHours(timeLeft.getHours() - 7);
    timeLeft.setMinutes(timeLeft.getMinutes() + 15);
    const hours =  timeLeft.getHours() < 10 ? `0${timeLeft.getHours()}` : timeLeft.getHours();
    const minutes =  timeLeft.getMinutes() < 10 ? `0${timeLeft.getMinutes()}` : timeLeft.getMinutes();
    const seconds =  timeLeft.getSeconds() < 10 ? `0${timeLeft.getSeconds()}` : timeLeft.getSeconds();

    const timeStr = `${hours}:${minutes}:${seconds}`;

    const coin = this.props.coinList.filter((c) => { return c.name === t.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;

    const rate = this.props.rates[t.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;
    const minimumFeeCoinArr = this.props.settings.filter((s) => {return s.name === `minimumFee${t.coin.toUpperCase()}`;});
    const minimumFeeCoin = minimumFeeCoinArr.length > 0 ? numeral(minimumFeeCoinArr[0].value).value() : 7000;

    const feeArr = this.props.settings.filter((s) => {return s.name === 'feeCoin';});
    const feeCoin = feeArr.length > 0 ? numeral(feeArr[0].value).value() : -1;

    const init = numeral(last * numeral(this.state.rate).value() * numeral(this.state.max).value()).value();
    const fee = (numeral(this.state.max).value() * feeCoin / 100) > minimumFeeCoin ?
      (init * feeCoin) / 100 :
      (numeral(last * numeral(this.state.rate).value() * numeral(minimumFeeCoin).value() / unit).value());
    const value = init - fee;
    return (
      <div className="row">
        <div className="col-md-12 col-xs-12">
          <p className={tStyles.textColor}>
            Bạn đang thực hiện giao dịch với lordknight1904. BTC của người bán đã được khóa lại để đảm bào cho giao dịch này. Vui lòng thanh toán cho người bán và thực hiện việc xác nhận dưới đây.
          </p>
        </div>
        <div className={`col-md-6 col-xs-12`}>
          <div className={`row ${tStyles.clockBanner}`}>
            <div className={`col-md-12 col-xs-12 ${tStyles.textColor} ${tStyles.clockTitle}`}>
              Giao dịch sẽ đóng trong vòng:
            </div>
            <div className={`col-md-12 col-xs-12 ${tStyles.textColor} ${tStyles.clock}`}>
              {timeStr}
            </div>
          </div>
          <div className='col-md-12 col-xs-12' style={{ margin: 'auto', marginTop: '50px' }}>
            {
              !typeBool ? (
                <div style={{ backgroundColor: 'red', padding: '10px 0' }}>
                  <label className={tStyles.uploadLabel} htmlFor="file-upload" style={{ height: '100%', width: '100%', marginBottom: '0', display: 'table' }}>
                    <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '10px' }}>
                      <i className="fa fa-cloud-upload" style={{ color: '#white' }} />
                      <span>&nbsp;Đăng bằng chứng</span>
                    </div>
                  </label>
                  <input id="file-upload" accept="image/jpeg, image/png" type="file" style={{ display: 'none' }} onChange={this.onUpload} />
                </div>
              ) : (
                <div style={{ backgroundColor: 'red' }} >
                  <label
                    className={tStyles.uploadLabel}
                    htmlFor="file-upload"
                    style={{
                      height: '100%',
                      padding: '10px 0',
                      width: '100%',
                      marginBottom: '0',
                      display: 'table'
                    }}
                    onClick={this.onPay}
                  >
                    <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '10px' }}>
                      <i className="fa fa-cloud-upload" style={{ color: '#white' }} />
                      <span>&nbsp;Đã nhận được chuyển khoản</span>
                    </div>
                  </label>
                </div>
              )
            }
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="row">
            <div className="col-md-10 col-xs-10" style={{ margin: 'auto', maxHeight: 'calc(100vh - 164px)', overflow: 'scroll' }}>
              <div className={tStyles.tableTitle}>
                Thông tin chi tiết
              </div>
              <table className={tStyles.table}>
                <tbody>
                  <tr>
                    <th>{typeBool ? 'Bán cho' : 'Mua từ'}</th>
                    <th>{t.createUser ? t.createUser.userName : ''}</th>
                  </tr>
                  <tr>
                    <th>Tỉ giá</th>
                    <th>{`${numeral(numeral(t.rate).value() * numeral(t.transferRate).value()).format('0,0')} VNĐ/${t.coin}`}</th>
                  </tr>
                  <tr>
                    <th>{`Số tiền ${!typeBool ? 'chuyển' : 'nhận'}`}</th>
                    <th>{`${numeral(value).format('0,0')} VNĐ(${feeCoin}% phí)`}</th>
                  </tr>
                  <tr>
                    <th>Lượng giới hạn</th>
                    <th>{`${t.min / unit} - ${t.max / unit} ${t.coin}`}</th>
                  </tr>
                  <tr>
                    <th>Phương thức thanh toán</th>
                    <th>Chuyển khoản ngân hàng Vietcombank</th>
                  </tr>
                  {
                    bool ? (
                      <tr>
                        <th>Số tài khoản</th>
                        <th>{t.accountNumber}</th>
                      </tr>
                    ) : <tr></tr>
                  }
                  {
                    bool ? (
                      <tr>
                        <th>Tên chủ tài khoản</th>
                        <th>{t.accountName}</th>
                      </tr>
                    ) : <tr></tr>
                  }
                  {
                    bool ? (
                      <tr>
                        <th>Địa chỉ ví người mua</th>
                        <th>jahsflhwjhoqds</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>nội dung chuyển khoản</th>
                        <th>{t.transferCode}</th>
                      </tr>
                    )
                  }
                  <tr>
                    <th>Bằng chứng chuyển khoản</th>
                    <th>
                      {
                        t.hasOwnProperty('evidenceDir') ? (
                          <div
                            style={{
                              backgroundImage: `url(/public/${t.evidenceDir})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'contain',
                              width: '300px',
                              height: '400px',
                            }}
                          />
                        ) : 'Chưa đang bằng chứng chuyển khoản'
                      }
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    transaction: getTransaction(state),
    id: getId(state),
    coinList: getCoinList(state),
    settings: getSettings(state),
    rates: getRates(state),
  };
}

Second.propTypes = {
  handleNext: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
  coinList: PropTypes.array.isRequired,
  settings: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
};

Second.contextTypes = {
};

export default connect(mapStateToProps)(Second);
