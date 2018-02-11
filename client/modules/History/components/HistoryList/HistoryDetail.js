import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl, Button, Table } from 'react-bootstrap';
import {  } from '../../HistoryActions';
import numeral from 'numeral';
import { getCoinList } from '../../../App/AppReducer';

class HistoryDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date(),
      start: new Date(),
    };
  }
  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  tick = () => {
    this.setState({ time: new Date() });
  };
  onTranslate = (str) => {
    switch (str) {
      case 'open': {
        return 'Mở';
      }
      case 'second': {
        return 'Đã đặt';
      }
      case 'third': {
        return 'Đã tải b.chứng';
      }
      case 'done': {
        return 'H.tất';
      }
      case 'buy': {
        return 'Mua';
      }
      case 'sell': {
        return 'Bán';
      }
      default: return '~';
    }
  };
  render() {
    const detail = this.props.detail;
    const coin = this.props.coinList.filter((c) => { return c.name === detail.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    // const unit = 1;

    const time = this.state.time;

    const start = new Date(detail.dateSecond);
    const timeLeft = new Date(start - time);
    timeLeft.setHours(timeLeft.getHours() - 7);
    timeLeft.setMinutes(timeLeft.getMinutes() + 15);
    const hours = timeLeft.getHours() < 10 ? `0${timeLeft.getHours()}` : timeLeft.getHours();
    const minutes = timeLeft.getMinutes() < 10 ? `0${timeLeft.getMinutes()}` : timeLeft.getMinutes();
    const seconds = timeLeft.getSeconds() < 10 ? `0${timeLeft.getSeconds()}` : timeLeft.getSeconds();

    const timeStr = `${hours}:${minutes}:${seconds}`;

    const multi = (this.props.id === detail.userId._id) ? 2 : 1;
    return (
      <tr>
        <th>{(detail.stage !== 'done' || detail.conflict) ? timeStr : '~'}</th>
        <th>{detail.createUser ? detail.createUser.userName : '~'}</th>
        <th>{this.onTranslate(detail.type)}</th>
        <th>{detail.userId ? detail.userId.userName : '~'}</th>
        <th>{this.onTranslate(detail.stage)}</th>
        <th>{numeral((detail.amount - detail.feeTrade * multi) / unit).format('0,0.[000000]')}</th>
        <th>{numeral(detail.feeNetwork / unit).format('0,0.[000000]')}</th>
        <th>{numeral(detail.feeTrade / unit).format('0,0.[000000]')}</th>
        <th>
          <Button bsStyle="info" bsSize="xsmall" onClick={() => this.props.onDetail(this.props.detail)}>
            C.tiết
          </Button>
          <Button bsStyle="warning" bsSize="xsmall" disabled>
            T.động
          </Button>
        </th>
      </tr>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps(state) {
  return {
    coinList: getCoinList(state),
  };
}

HistoryDetail.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onDetail: PropTypes.func.isRequired,
  coinList: PropTypes.array.isRequired,
  detail: PropTypes.object.isRequired,
};

HistoryDetail.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(HistoryDetail);
