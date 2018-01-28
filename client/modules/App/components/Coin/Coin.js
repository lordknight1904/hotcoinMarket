import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import homeStyles from '../../../Home/home.css';
import { changeCoin } from '../../AppActions';
import { getCoin, getRates } from '../../AppReducer';
import numeral from 'numeral';

class Coin extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const rate = this.props.rates[this.props.name];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : '~';
    return (
      <button
        className={`${this.props.coin === this.props.name ? homeStyles.tabActive : ''}`}
        onClick={() => this.props.dispatch(changeCoin(this.props.name))}
      >
        <div className="col-md-2 col-xs-2">
          <div className="row">
            {this.props.name}
          </div>
        </div>
        <div className="col-md-10 col-xs-10">
          <div className="row" style={{ color: 'rgb(255, 105, 57)', textAlign: 'right' }}>
            {`${numeral(last).format('0,0')} đ`}
          </div>
          <div className="row" style={{ color: 'rgb(51, 199, 23)', textAlign: 'right' }}>
            {`${numeral(last).format('0,0')} đ`}
          </div>
        </div>
      </button>
    );
  }
}
function mapStateToProps(state) {
  return {
    coin: getCoin(state),
    rates: getRates(state),
  };
}
Coin.propTypes = {
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
};
Coin.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(Coin);
