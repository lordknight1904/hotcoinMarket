import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl, Form, Col } from 'react-bootstrap';
import numeral from 'numeral';
import tStyles from '../../transaction.css';
import { getTransaction } from '../../TransactionReducer';
import { marketSecond, setTransaction } from '../../TransactionActions';
import { getId, getCoin, getRates } from '../../../App/AppReducer';
import { setNotify } from '../../../App/AppActions';

class First extends Component {
  constructor(props){
    super(props);
    this.state = {
      amount: '',
      accountNumber: '',
      accountName: '',
    };
  }
  onAmount = (event) => {
    const number = numeral(event.target.value).format('0,0.[000000]');
    this.setState({ amount: number });
  };
  onAddress = (event) => {
    this.setState({ address: event.target.value });
  };
  onAccountNumber = (event) => {
    this.setState({ accountNumber: event.target.value });
  };
  onAccountName = (event) => {
    this.setState({ accountName: event.target.value });
  };
  onClick = () => {
    const t = this.props.transaction;
    if (this.state.amount === '') {
      this.props.dispatch(setNotify('Vui lòng nhập vào số lượng'));
      return;
    }
    if (numeral(this.state.amount).value() <= 0) {
      this.props.dispatch(setNotify('Số lượng phải lớn hơn 0'));
      return;
    }
    if (t.type === 'buy' && this.state.accountNumber === '') {
      this.props.dispatch(setNotify('Vui lòng điền số tài khoản'));
      return;
    }
    if (t.type === 'buy' && this.state.accountName === '') {
      this.props.dispatch(setNotify('Vui lòng điền tên chủ tài khoản'));
      return;
    }
    const market = {
      id: t._id,
      accountName: this.state.accountName,
      accountNumber: this.state.accountNumber,
      userId: this.props.id,
      amount: numeral(this.state.amount).value(),
    };
    this.props.dispatch(marketSecond(market)).then((res) => {
      if (res !== 'not ready') {
        this.props.dispatch(setTransaction(res));
        this.props.handleNext();
      } else {
        this.props.dispatch(setNotify('Giao dịch đã được thực hiện bởi người khác'))
      }
    });
  };
  render() {
    const transaction = this.props.transaction;
    if (!transaction.hasOwnProperty('type')) return <div></div>;
    const typeBool = transaction.type === 'buy';
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;
    return (
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <div className="row">
            <div className="col-md-10 col-xs-10" style={{ margin: 'auto' }}>
              <Form horizontal>
                <FormGroup controlId="balanceForm">
                  <Col sm={6}>
                    <Button onClick={this.onClick} block>{typeBool ? 'Bán' : 'Mua'}</Button>
                  </Col>
                  <Col sm={6}>
                    <FormControl className={tStyles.textBox} type="text" value={this.state.amount} onChange={this.onAmount} autoComplete="off" placeholder="Số lượng"/>
                  </Col>
                </FormGroup>
                <FormGroup controlId="priceForm">
                  <Col sm={6}>
                    {
                      typeBool ? (
                        <FormControl className={tStyles.textBox} type="text" value={this.state.accountNumber} onChange={this.onAccountNumber} autoComplete="off" placeholder="Số tài khoản của bạn"/>
                      ) : (
                        <FormControl className={tStyles.textBox} type="text" disabled autoComplete="off" placeholder="Địa chỉ của bạn"/>
                      )
                    }
                  </Col>
                  <Col sm={6}>
                    {
                      typeBool ? (
                        <FormControl className={tStyles.textBox} type="text" value={this.state.accountName} onChange={this.onAccountName} autoComplete="off" placeholder="Tên chủ tài khoản"/>
                      ) : ''
                    }
                  </Col>
                </FormGroup>
              </Form>
            </div>
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
                  <th>{typeBool ? 'Bán cho' : 'Mua từ'}</th>
                  <th>{transaction.createUser ? transaction.createUser.userName : ''}</th>
                </tr>
                <tr>
                  <th>Tỉ giá</th>
                  <th>{`${numeral(numeral(transaction.rate).value() * last).format('0,0')} VNĐ/${transaction.coin}`}</th>
                </tr>
                <tr>
                  <th>{`Số tiền ${!typeBool ? 'chuyển' : 'nhận'}`}</th>
                  <th>{`${numeral(numeral(transaction.rate).value() * last * numeral(this.state.amount).value()).format('0,0')} VNĐ/${transaction.coin}`}</th>
                </tr>
                <tr>
                  <th>Lượng giới hạn</th>
                  <th>{`${transaction.min} - ${transaction.max} ${transaction.coin}`}</th>
                </tr>
                <tr>
                  <th>Phương thức thanh toán</th>
                  <th>{`Chuyển khoản ngân hàng ${transaction.bank ? transaction.bank.name : ''}`}</th>
                </tr>
                {
                  !typeBool ? (
                    <tr>
                      <th>Số tài khoản</th>
                      <th>{transaction.accountNumber}</th>
                    </tr>
                  ) : ''
                }
                {
                  !typeBool ? (
                    <tr>
                      <th>Tên chủ tài khoản</th>
                      <th>{transaction.accountName}</th>
                    </tr>
                  ) : ''
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
    id: getId(state),
    coin: getCoin(state),
    rates: getRates(state),
  };
}

First.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

First.contextTypes = {
};

export default connect(mapStateToProps)(First);
