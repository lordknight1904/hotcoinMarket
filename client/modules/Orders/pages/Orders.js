import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl, Modal  } from 'react-bootstrap';
import { getCoin, getUserName } from '../../App/AppReducer';
import { getMyTradingMarket } from '../OrderActions';
import { getTrading } from '../OrderReducer';
import Detail from '../components/Detail/Detail';
import numeral from "numeral";
import ordersStyles from '../ordersStyles.css';

class Orders extends Component {
  constructor(props){
    super(props);
    this.state = {
      isDetail: false,
      detail: {},
    };
  }
  componentWillMount() {
    if (this.props.userName === '') {
      this.context.router.push('/');
    }
  }
  componentDidMount() {
    this.props.dispatch(getMyTradingMarket(this.props.coin, this.props.userName));
  }
  openDetail = (detail) => {
    this.setState({ isDetail: true, detail });
  };
  closeDetail = () => {
    this.setState({ isDetail: false, detail: {} });
  };
  render() {
    const t = this.state.detail;
    const bool = t.type === 'buy';
    return (
      <div className={`col-md-12 col-xs-12`}>
        <div className="row">
          <div className="col-md-12 col-xs-12" style={{ padding: '6px 0', color: 'rgb(206, 210, 187)' }}>
            CÁC LỆNH ĐANG GIAO DỊCH
          </div>
          <div className="col-md-12 col-xs-12">
            {
              this.props.trading.map((t, index) => (
                <div className="row" key={index}>
                  <Detail detail={t} openDetail={this.openDetail} />
                </div>
              ))
            }
          </div>
        </div>

        <Modal show={this.state.isDetail} onHide={this.closeDetail}>
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết giao dịch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              t.hasOwnProperty('_id') ? (
                <table className={ordersStyles.table}>
                  <tbody>
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
                    {/*<tr>*/}
                      {/*<th>Lượng giới hạn</th>*/}
                      {/*<th>{`${t.min} - ${t.max} ${t.coin}`}</th>*/}
                    {/*</tr>*/}
                    <tr>
                      <th>Số lượng</th>
                      <th>{`${t.amount}`}</th>
                    </tr>
                    <tr>
                      <th>Phương thức thanh toán</th>
                      <th>{`Chuyển khoản ngân hàng ${t.bank.name}`}</th>
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
              ) : ''
            }
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    trading: getTrading(state),
    userName: getUserName(state),
    coin: getCoin(state),
  };
}

Orders.propTypes = {
  dispatch: PropTypes.func.isRequired,
  trading: PropTypes.array.isRequired,
  coin: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

Orders.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Orders);
