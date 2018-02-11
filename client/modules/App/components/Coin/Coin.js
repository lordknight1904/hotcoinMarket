import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import homeStyles from '../../../Home/home.css';
import {changeCoin, fetchLatest, setLatest} from '../../AppActions';
import { getCoin, getRates, getLatest } from '../../AppReducer';
import numeral from 'numeral';
import { Col, Row } from 'react-bootstrap';

class Coin extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const rate = this.props.rates[this.props.name];
    const latest = this.props.latest[this.props.name];
    const lastBuy = (rate && rate.hasOwnProperty('last')) ? numeral(numeral(rate.last).value() * numeral(latest && latest.hasOwnProperty('min') ? latest.min : 1).value()).format('0,0')  : '~';
    const lastSell = (rate && rate.hasOwnProperty('last')) ? numeral(numeral(rate.last).value() * numeral(latest && latest.hasOwnProperty('max') ? latest.max : 1).value()).format('0,0')  : '~';
    return (
      <button
        className={`${this.props.coin === this.props.name ? homeStyles.tabActive : ''}`}
        onClick={() => {
          this.props.dispatch(changeCoin(this.props.name));
        }}
      >
        <Col md={2} xs={2}>
          <Row>
            {this.props.name}
          </Row>
        </Col>
        <Col md={10} xs={10}>
          <Row style={{ color: 'rgb(255, 105, 57)', textAlign: 'right' }}>
            {`${numeral(lastSell).format('0,0')} đ`}
          </Row>
          <Row style={{ color: 'rgb(51, 199, 23)', textAlign: 'right' }}>
            {`${numeral(lastBuy).format('0,0')} đ`}
          </Row>
        </Col>
      </button>
    );
  }
}
function mapStateToProps(state) {
  return {
    coin: getCoin(state),
    rates: getRates(state),
    latest: getLatest(state),
  };
}
Coin.propTypes = {
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
  latest: PropTypes.object.isRequired,
};
Coin.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(Coin);
