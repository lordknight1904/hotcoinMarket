import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getId, getWallets, getCoinList, getRates, getLatest } from '../../App/AppReducer';
import { setNotify, directSend } from '../../App/AppActions';
import { Table, FormGroup, HelpBlock, FormControl, Button } from 'react-bootstrap';
import numeral from 'numeral';
import styles from '../wallet.css';
import appStyles from '../../App/App.css';

class Wallet extends Component{
  constructor(props){
    super(props);
    this.state = {
      type: '',
      coin: {},
      address: '',
      amount: 0,
      isSending: false,
    };
  }
  componentWillMount() {
    if (this.props.id === '') {
      this.context.router.push('/');
    }
  }
  handleAction = (type, coin) => {
    this.setState({ type, coin });
  };
  onCancel = () => {
    this.setState({ type: '', coin: {} });
  };
  sendCoin = () => {
    if (this.state.address.trim() === '') {
      this.props.dispatch(setNotify('Wrong address.'));
      return;
    }
    if (isNaN(this.state.amount.trim())) {
      this.props.dispatch(setNotify('Invalid quantity.'));
      return;
    }
    const send = {
      id: this.props.id,
      coin: this.state.coin.name,
      address: this.state.address,
      amount: Number(this.state.amount) * Number(this.state.coin.unit),
    };
    this.setState({ isSending: true });
    this.props.dispatch(directSend(send)).then((res) => {
      this.setState({ isSending: false });
      if (res.order === 'success') {
        this.props.dispatch(setNotify('Đã chuyển coin'));
      } else {
        this.props.dispatch(setNotify(res.market));
      }
    });
  };
  onAddress = (event) => { this.setState({ address: event.target.value }); };
  onAmount = (event) => { this.setState({ amount: event.target.value }); };
  render(){
    const wallet = this.props.wallet;
    const rates = this.props.rates;
    const latest = this.props.latest;
    const coin = this.props.coinList.filter((cl) => {return cl.name === this.state.coin;});
    let vndBalance = 0;
    return (
      <Table striped bordered condensed hover className={`${styles.tableStripped} ${styles.table}`} >
        <thead>
          <tr>
            <th>Coin</th>
            <th>Đã xác nhận</th>
            <th>Chưa xác nhận</th>
            <th>Đang giữ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
        {
          (this.state.type === 'address') ? (
            <tr>
              <th colSpan="4">
                <p>{`Địa chỉ: ${this.state.coin.name}:`}</p><br/>
                <p>{wallet[this.state.coin.name].address.trim()}</p><br/>
                <p>{`Chuyển ${this.state.coin.name} đến địa chỉ trên`}</p><br/>
              </th>
              <th>
                <p className={styles.pHover} style={{ float: 'left' }} onClick={this.onCancel}>Hủy</p>
              </th>
            </tr>
          ) : <tr />
        }
        {
          (this.state.type === 'send') ? (
            <tr>
              <th colSpan="4" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
                <FormGroup style={{ marginBottom: '5px' }} >
                  <FormControl type="text" onChange={this.onAddress} placeholder={`Đỉa chỉ ${this.state.coin.name} nhận`} style={{ marginBottom: '5px' }} />
                  <FormControl type="text" onChange={this.onAmount} placeholder="Số lượng" />
                </FormGroup>
                <p style={{ float: 'left' }}>Phí</p>
                <p style={{ float: 'right'}}>{}</p>
                <br/>
                <Button style={{ float: 'right' }} bsStyle="primary" bsSize="xsmall" disabled={this.state.isSending} onClick={this.sendCoin}>Gửi</Button>
              </th>
              <th>
                <p className={styles.pHover} style={{ float: 'left' }} onClick={this.onCancel}>Hủy</p>
              </th>
            </tr>
          ) : <tr />
        }
        {
          this.props.coinList.map((cl, index) => {
            if (cl.name === 'USDT') return;
            vndBalance +=
              (wallet[cl.name] ? (wallet[cl.name].balance / cl.unit) : 0)  *
              (rates[cl.name] ? rates[cl.name].last : 1) *
              (latest[cl.name] ? latest[cl.name].max : 1);
            return (
              <tr key={index}>
                <th>{cl.name}</th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>
                  {wallet[cl.name] ? numeral(wallet[cl.name].balance / cl.unit).format('0,0.000000') : '~'}
                  </th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>{wallet[cl.name] ? numeral(wallet[cl.name].unconfirmedBalance / cl.unit).format('0,0.000000') : '~'}</th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>
                  {wallet[cl.name] ? numeral(wallet[cl.name].hold).format('0,0.[000000]') : '~'}
                  </th>
                <th style={{ fontWeight: 'normal' }}>
                  <p className={styles.pHover} style={{ float: 'left' }} onClick={() => this.handleAction('address', cl)}>Nhận</p>
                  <p className={styles.pHover} style={{ float: 'right' }} onClick={() => this.handleAction('send', cl)}>Gửi</p>
                </th>
              </tr>
            )
          })
        }

        <tr>
          <th colSpan="4">VNĐ</th>
          <th>{`${numeral(vndBalance).format('0,0')} đ`}</th>
        </tr>
        </tbody>
      </Table>
    );
  }
}

function mapStateToProps(state) {
  return {
    id: getId(state),
    wallet: getWallets(state),
    coinList: getCoinList(state),
    rates: getRates(state),
    latest: getLatest(state),
  };
}
Wallet.propTypes = {
  dispatch: PropTypes.func,
  id: PropTypes.string.isRequired,
  wallet: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
  latest: PropTypes.object.isRequired,
  coinList: PropTypes.array.isRequired,
};
Wallet.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Wallet);
