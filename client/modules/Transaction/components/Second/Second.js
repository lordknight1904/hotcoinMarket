import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import tStyles from '../../transaction.css';
import { getTransaction } from '../../TransactionReducer';
import numeral from 'numeral';

class Second extends Component {
  constructor(props){
    super(props);
    this.state = {
      time: {},
      start: new Date(),
    };
  }
  componentDidMount() {
    this.setState({ time: new Date() });
    this.timer = setInterval(this.tick, 1000);
  }
  tick = () => {
    this.setState({ time: new Date() });
  };

  render() {
    const t = this.props.transaction;
    if (!t.hasOwnProperty('type')) return <div></div>;
    const bool = t.type === 'buy';
    const time = this.state.time;

    const start = new Date(t.dateSecond);
    const timeLeft = new Date(start - time);
    timeLeft.setHours(timeLeft.getHours() - 7);
    timeLeft.setMinutes(timeLeft.getMinutes() + 15);
    const hours =  timeLeft.getHours() < 10 ? `0${timeLeft.getHours()}` : timeLeft.getHours();
    const minutes =  timeLeft.getMinutes() < 10 ? `0${timeLeft.getMinutes()}` : timeLeft.getMinutes();
    const seconds =  timeLeft.getSeconds() < 10 ? `0${timeLeft.getSeconds()}` : timeLeft.getSeconds();

    const timeStr = `${hours}:${minutes}:${seconds}`;

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
          <div className='col-md-12 col-xs-12' style={{ margin: 'auto', paddingTop: '50px' }}>
            <Button block>Đã hoàn tất thanh toán</Button>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="row">
            <div className="col-md-10 col-xs-10" style={{ margin: 'auto' }}>
              <div className={tStyles.tableTitle}>
                Thông tin chi tiết
              </div>
              <table className={tStyles.table}>
                <tr>
                  <th>{bool ? 'Bán cho' : 'Mua từ'}</th>
                  <th>{t.createUser ? t.createUser.userName : ''}</th>
                </tr>
                <tr>
                  <th>Tỉ giá</th>
                  <th>{`${numeral(numeral(t.rate).value() * numeral(t.transferRate).value()).format('0,0')} VNĐ/${t.coin}`}</th>
                </tr>
                <tr>
                  <th>{`Số tiền ${!bool ? 'chuyển' : 'nhận'}`}</th>
                  <th>{`${numeral(numeral(t.rate).value() * numeral(t.transferRate).value() * numeral(t.amount).value()).format('0,0')} VNĐ/${t.coin}`}</th>
                </tr>
                <tr>
                  <th>Lượng giới hạn</th>
                  <th>{`${t.min} - ${t.max} ${t.coin}`}</th>
                </tr>
                <tr>
                  <th>Phương thức thanh toán</th>
                  <th>Chuyển khoản ngân hàng Vietcombank</th>
                </tr>
                {
                  !bool ? (
                    <tr>
                      <th>Số tài khoản</th>
                      <th>{t.accountNumber}</th>
                    </tr>
                  ) : <tr></tr>
                }
                {
                  !bool ? (
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
  };
}

Second.propTypes = {
  dispatch: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
};

Second.contextTypes = {
};

export default connect(mapStateToProps)(Second);
