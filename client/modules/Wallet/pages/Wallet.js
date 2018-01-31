import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getId, getWallets, getCoinList } from '../../App/AppReducer';
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
        this.props.dispatch(setNotify('Coin transfered.'));
      } else {
        this.props.dispatch(setNotify(res.order));
      }
    });
  };
  onAddress = (event) => { this.setState({ address: event.target.value }); };
  onAmount = (event) => { this.setState({ amount: event.target.value }); };
  render(){
    const wallet = this.props.wallet;
    const coin = this.props.coinList.filter((cl) => {return cl.name === this.state.coin;});
    return (
      <Table striped bordered condensed hover className={`${styles.tableStripped} ${styles.table}`} >
        <thead>
          <tr>
            <th>Coin</th>
            <th>Confirmed</th>
            <th>Unconfirmed</th>
            <th>Holding</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {
          (this.state.type === 'address') ? (
            <tr>
              <th colSpan="4">
                <p>{`Address ${this.state.coin.name}:`}</p><br/>
                <p>{wallet[this.state.coin.name].address.trim()}</p><br/>
                <p>{`Transfer ${this.state.coin.name} to the above address`}</p><br/>
              </th>
              <th>
                <p className={styles.pHover} style={{ float: 'left' }} onClick={this.onCancel}>Cancel</p>
              </th>
            </tr>
          ) : <tr />
        }
        {
          (this.state.type === 'send') ? (
            <tr>
              <th colSpan="4" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
                <FormGroup style={{ marginBottom: '5px' }} >
                  <FormControl type="text" onChange={this.onAddress} placeholder={`Receive address ${this.state.coin.name}`} style={{ marginBottom: '5px' }} />
                  <FormControl type="text" onChange={this.onAmount} placeholder="Amount" />
                </FormGroup>
                <p style={{ float: 'left' }}>Fee</p>
                <p style={{ float: 'right'}}>{}</p>
                <br/>
                <Button style={{ float: 'right' }} bsStyle="primary" bsSize="xsmall" disabled={this.state.isSending} onClick={this.sendCoin}>Submit</Button>
              </th>
              <th>
                <p className={styles.pHover} style={{ float: 'left' }} onClick={this.onCancel}>Cancel</p>
              </th>
            </tr>
          ) : <tr />
        }
        {
          this.props.coinList.map((cl, index) => {
            return (
              <tr key={index}>
                <th>{cl.name}</th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>
                  {
                    (cl.name !== 'USDT') ? (
                        wallet[cl.name] ? numeral(wallet[cl.name].balance / cl.unit).format('0,0.000000') : '~'
                      ) : (
                        wallet[cl.name] ? numeral(wallet[cl.name].balance).format('0,0.000000') : '~'
                      )
                  }
                  </th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>{wallet[cl.name] ? numeral(wallet[cl.name].unconfirmedBalance / cl.unit).format('0,0.000000') : '~'}</th>
                <th style={{ fontWeight: 'normal', textAlign: 'right' }}>
                  {
                    (cl.name !== 'USDT') ? (
                      wallet[cl.name] ? numeral(wallet[cl.name].hold / cl.unit).format('0,0.[000000]') : '~'
                    ) : (
                      wallet[cl.name] ? numeral(wallet[cl.name].hold).format('0,0.[000000]') : '~'
                    )
                  }
                  </th>
                <th style={{ fontWeight: 'normal' }}>
                  {
                    (cl.name !== 'USDT') ? (
                      <p className={styles.pHover} style={{ float: 'left' }} onClick={() => this.handleAction('address', cl)}>Deposit</p>
                    ) : ''
                  }
                  {
                    (cl.name !== 'USDT') ? (
                        <p className={styles.pHover} style={{ float: 'right' }} onClick={() => this.handleAction('send', cl)}>Withdraw</p>
                    ) : ''
                  }
                </th>
              </tr>
            )
          })
        }
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
  };
}
Wallet.propTypes = {
  dispatch: PropTypes.func,
  id: PropTypes.string.isRequired,
  wallet: PropTypes.object.isRequired,
  coinList: PropTypes.array.isRequired,
};
Wallet.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Wallet);
