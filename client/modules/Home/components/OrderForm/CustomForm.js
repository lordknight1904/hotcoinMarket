import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import homeStyles from '../../home.css';
import detailStyles from '../../../Orders/ordersStyles.css';
import { setNotify } from '../../../App/AppActions';
import { getCoin, getId } from '../../../App/AppReducer';
import { Tab, Row, Col, Nav, NavItem, Form, FormGroup, FormControl, DropdownButton, Button, MenuItem } from 'react-bootstrap';
import numeral from 'numeral';
import { createMarketOrder, getMySellMarket, getMyBuyMarket } from '../../HomeActions';
import { getBanks, getUserName, getWallets, getCoinList, getRates, getSettings } from '../../../App/AppReducer';

class CustomForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: '',
      max: '',
      rate: '',
      bank: '',
      accountNumber: '',
      accountName: '',
      dropDownTitle: 'Chọn ngân hàng',
      isSubmitting: false,
    };
  }
  onAccountName = (event) => {
    this.setState({ accountName: event.target.value });
  };
  onAccountNumber = (event) => {
    this.setState({ accountNumber: event.target.value });
  };
  onMin = (event) => {
    const count = (event.target.value.match(/\./g) || []).length;
    const number = numeral(event.target.value).format('0,0.[000000]');
    switch (count) {
      case 0: {
        this.setState({ min: number });
        break;
      }
      case 1: {
        this.setState({ min: event.target.value });
        break;
      }
      default: {
        this.setState({ min: number });
        break;
      }
    }
  };
  onMax = (event) => {
    const count = (event.target.value.match(/\./g) || []).length;
    const number = numeral(event.target.value).format('0,0.[000000]');
    switch (count) {
      case 0: {
        this.setState({ max: number });
        break;
      }
      case 1: {
        this.setState({ max: event.target.value });
        break;
      }
      default: {
        this.setState({ max: number });
        break;
      }
    }
  };
  onRate = (event) => {
    const number = numeral(event.target.value).format('0,0.[000000]');
    this.setState({ rate: number });
  };
  onClick = () => {
    if (this.props.id === '') {
      this.props.dispatch(setNotify('Đăng nhập để đặt lệnh'));
      return;
    }
    if (this.state.bank === '') {
      this.props.dispatch(setNotify('Vui lòng chọn ngân hàng'));
      return;
    }
    if (this.state.min === '') {
      this.props.dispatch(setNotify('Vui lòng điền số lượng tối thiểu'));
      return;
    }
    if (this.state.max === '') {
      this.props.dispatch(setNotify('Vui lòng điền số lượng tối đa'));
      return;
    }
    if (numeral(this.state.min).value() <= 0) {
      this.props.dispatch(setNotify('Số lượng tối thiểu phải lớn hơn 0'));
      return;
    }
    if (numeral(this.state.max).value() <= 0) {
      this.props.dispatch(setNotify('Số lượng tối đa phải lớn hơn 0'));
      return;
    }
    if (numeral(this.state.max).value() < numeral(this.state.min).value()) {
      this.props.dispatch(setNotify('Số lượng tối đa phải lớn hơn số lượng tối thiểu'));
      return;
    }
    if (this.state.rate === '') {
      this.props.dispatch(setNotify('Vui lòng điền tỉ giá.'));
      return;
    }
    if (numeral(this.state.rate).value() <= 0) {
      this.props.dispatch(setNotify('Tỉ giá phải lớn hơn 0'));
      return;
    }
    if (this.props.type === 'sell' && this.state.accountNumber === '') {
      this.props.dispatch(setNotify('Vui lòng điền số tài khoản'));
      return;
    }
    if (this.props.type === 'sell' && this.state.accountName === '') {
      this.props.dispatch(setNotify('Vui lòng điền tên tài khoản'));
      return;
    }
    const market = {
      createUser: this.props.id,
      type: this.props.type,
      bank: this.state.bank,
      rate: numeral(this.state.rate).value(),
      min: numeral(this.state.min).value(),
      max: numeral(this.state.max).value(),
      coin: this.props.coin,
      accountName: this.state.accountName,
      accountNumber: this.state.accountNumber,
    };
    this.props.dispatch(createMarketOrder(market)).then((res) => {
      switch (res.market) {
        case 'success': {
          this.setState({
            rate: '',
            min: '',
            max: '',
            bank: '',
            accountName: '',
            accountNumber: '',
            dropDownTitle: 'Chọn ngân hàng',
          });
          this.props.dispatch(setNotify('Đặt lệnh thành công'));
          this.props.dispatch(getMyBuyMarket(this.props.coin, this.props.userName));
          this.props.dispatch(getMySellMarket(this.props.coin, this.props.userName));
          break;
        }
        case 'error': {
          this.props.dispatch(setNotify('Đặt lệnh không thành công'));
          break;
        }
        default: {
          this.props.dispatch(setNotify(res.market));
        }
      }
    })
  };
  onSelect = (eventKey) => {
    this.setState({ bank: eventKey._id, dropDownTitle: eventKey.name });
  };
  render() {
    const wallet = this.props.wallets[this.props.coin];
    const coin = this.props.coinList.filter((cl) => {return cl.name === this.props.coin;});
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    const balance = (this.props.id !== '') ? ((wallet) ? numeral(wallet.balance/unit).format('0,0.000000') : 'Đang tải') : 'Chưa đăng nhập';
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;

    const minimumFeeCoinArr = this.props.settings.filter((s) => {return s.name === `minimumFee${this.props.coin.toUpperCase()}`;});
    const minimumFeeCoin = minimumFeeCoinArr.length > 0 ? numeral(minimumFeeCoinArr[0].value).value() : 7000;

    const feeArr = this.props.settings.filter((s) => {return s.name === 'feeCoin';});
    const feeCoin = feeArr.length > 0 ? numeral(feeArr[0].value).value() : -1;

    const init = numeral(last * numeral(this.state.rate).value() * numeral(this.state.max).value()).value();
    const fee = (numeral(this.state.max).value() * feeCoin / 100) > minimumFeeCoin ?
      (init * feeCoin) / 100 :
      (numeral(last * numeral(this.state.rate).value() * numeral(minimumFeeCoin).value() / unit).value());
    const value = init - fee;
    return (
      <Form horizontal>
        <Row style={{ display: 'flex' }}>
          <Col md={10} xs={10}>
            <FormGroup>
              <Col md={4}>
                <FormControl className={homeStyles.disabledForm} id={`balanceForm${this.props.type}1`} type="text" value={balance} disabled placeholder="Số dư"/>
              </Col>
              <Col md={4} className={homeStyles.customInput}>
                <FormControl id={`balanceForm${this.props.type}2`} type="text" autoComplete="off" value={this.state.min} onChange={this.onMin} placeholder="Tối thiểu"/>
              </Col>
              <Col md={4} className={homeStyles.customInput}>
                <FormControl id={`balanceForm${this.props.type}3`} type="text" autoComplete="off" value={this.state.max} onChange={this.onMax} placeholder="Tối đa"/>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col md={4}>
                <FormControl className={homeStyles.disabledForm} id={`priceForm${this.props.type}1`} type="text" placeholder={`${numeral(last).format('0,0')} USD`} disabled/>
              </Col>
              <Col md={4} className={homeStyles.customInput}>
                <FormControl id={`priceForm${this.props.type}2`} type="text" autoComplete="off" value={this.state.rate} onChange={this.onRate} placeholder="VND/USD"/>
              </Col>
              <Col md={4}>
                <FormControl
                  className={homeStyles.disabledForm}
                  id={`priceForm${this.props.type}3`}
                  type="text"
                  placeholder={`${numeral(value).format('0,0')} VNĐ(${feeCoin}% phí)`}
                  disabled
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col md={4} className={homeStyles.bankDropDown}>
                <DropdownButton
                  title={this.state.dropDownTitle}
                  id={`bankDropDown${this.props.type}`}
                  onSelect={this.onSelect}
                >
                  {
                    this.props.banks.map((b, index) => (
                      <MenuItem key={index} eventKey={b}>{b.name}</MenuItem>
                    ))
                  }
                </DropdownButton>
              </Col>
              <Col md={4} className={homeStyles.customInput}>
                {
                  (this.props.type === 'sell') ? (
                      <FormControl type="text" placeholder="Số tài khoản" value={this.state.accountNumber} onChange={this.onAccountNumber}/>
                    ) : ''
                }
              </Col>
              <Col sm={4} className={homeStyles.customInput}>
                {
                  (this.props.type === 'sell') ? (
                      <FormControl type="text" placeholder="Tên chủ tài khoản" value={this.state.accountName} onChange={this.onAccountName}/>
                    ) : ''
                }
              </Col>
            </FormGroup>
          </Col>
          <Col md={1} xs={1} style={{ paddingBottom: '15px' }}>
            <Row style={{ backgroundColor: 'red', height: '100%', borderRadius: '4px' }}>
              <label className={detailStyles.uploadLabel} style={{ height: '100%', width: '100%', marginBottom: '0', display: 'table' }} onClick={this.onClick}>
                <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '10px' }}>
                  <span style={{ paddingLeft: '7px', color: 'white' }}>Đặt</span>
                </div>
              </label>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}
function mapStateToProps(state) {
  return {
    coin: getCoin(state),
    id: getId(state),
    banks: getBanks(state),
    userName: getUserName(state),
    wallets: getWallets(state),
    coinList: getCoinList(state),
    rates: getRates(state),
    settings: getSettings(state),
  };
}
CustomForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  banks: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  wallets: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
  coinList: PropTypes.array.isRequired,
  settings: PropTypes.array.isRequired,
};
Form.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(CustomForm);
