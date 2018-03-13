import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import homeStyles from '../home.css';
import List from '../components/List/List';
import Open from '../components/Open/Open';
import SwipeableViews from 'react-swipeable-views';
import OrderForm from '../components/OrderForm/OrderForm';
import { getBuyMarket, getSellMarket, setMaxBuy, setMaxSell } from '../HomeActions';
import { getMaxSell, getMaxBuy } from '../HomeReducer';
import { getId, getRates, getCoin, getLatest, getSlideIndex } from '../../App/AppReducer';
import numeral from 'numeral';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      slideIndex: 0,
      oldMaxBuy: '',
      oldMaxSell: '',
    };
  }
  componentDidMount() {
    this.props.dispatch(getBuyMarket(this.props.coin, this.props.maxBuy));
    this.props.dispatch(getSellMarket(this.props.coin, this.props.maxSell));
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.oldMaxBuy !== nextProps.maxBuy) {
      this.props.dispatch(getBuyMarket(this.props.coin, nextProps.maxBuy));
      this.setState({ maxBuy: nextProps.maxBuy });
    }
    if (this.state.oldMaxSell !== nextProps.maxSell) {
      this.props.dispatch(getSellMarket(this.props.coin, nextProps.maxSell));
      this.setState({ maxSell: nextProps.maxSell });
    }
  }

  handleMaxSell = (event) => {
    const count = (event.target.value.match(/\./g) || []).length;
    const number = numeral(event.target.value).format('0,0.[000000]');
    switch (count) {
      case 0: {
        this.props.dispatch(setMaxSell(number));
        break;
      }
      case 1: {
        this.props.dispatch(setMaxSell(event.target.value));
        break;
      }
      default: {
        this.props.dispatch(setMaxSell(number));
        break;
      }
    }
  };
  handleMaxBuy = (event) => {
    const count = (event.target.value.match(/\./g) || []).length;
    const number = numeral(event.target.value).format('0,0.[000000]');
    switch (count) {
      case 0: {
        this.props.dispatch(setMaxBuy(number));
        break;
      }
      case 1: {
        this.props.dispatch(setMaxBuy(event.target.value));
        break;
      }
      default: {
        this.props.dispatch(setMaxBuy(number));
        break;
      }
    }
  };
  render() {
    const rate = this.props.rates[this.props.coin];
    const latest = this.props.latest[this.props.coin];
    const lastBuy = (rate && rate.hasOwnProperty('last')) ? (rate.last) * ((latest && latest.hasOwnProperty('min') ? latest.min : 1)) : 0;
    const lastSell = (rate && rate.hasOwnProperty('last')) ? (rate.last) * ((latest && latest.hasOwnProperty('max') ? latest.max : 1)) : 0;
    return (
    <div className="row">
      <SwipeableViews
        index={this.props.slideIndex}
        onChangeIndex={this.handleChange}
      >
        <div className="col-md-12 col-xs-12">
          <div className="row">
            <div className="col-md-6 col-xs-12">
              <div className="row">
                <div className={homeStyles.exclusive}>
                  <ul className={homeStyles.pricingWrapper}>
                    <header className={homeStyles.pricingHeader}>
                      <h2 style={{ color: 'rgb(51, 199, 23)' }}>Giá mua</h2>
                      <div className={homeStyles.price}>
                        <span className={homeStyles.value} style={{ color: 'rgb(51, 199, 23)' }}>{numeral(lastBuy).format('0,0')}</span>
                        <span className={homeStyles.currency}>đ</span>
                        <span className={homeStyles.duration}>{this.props.coin}</span>
                      </div>
                    </header>
                    <footer className={homeStyles.pricingFooter}>
                      <FormGroup style={{ width: '50%', display: 'inline-block', transition: 'all .6s' }}>
                        <InputGroup>
                          <FormControl
                            type="text"
                            onChange={this.handleMaxBuy}
                            style={{ backgroundColor: '#404a52', color: 'white', borderColor: '#ff6939' }}
                          />
                          <InputGroup.Button>
                            <Button
                              style={{ backgroundColor: '#ff6939', borderColor: '#ff6939' }}
                            >
                              Tìm
                            </Button>
                          </InputGroup.Button>
                        </InputGroup>
                      </FormGroup>
                    </footer>
                  </ul>
                </div>
              </div>
              <List type="buy"/>
            </div>
            <div className="col-md-6 col-xs-12">
              <div className="row">
                <div className={homeStyles.exclusive}>
                  <ul className={homeStyles.pricingWrapper}>
                    <header className={homeStyles.pricingHeader}>
                      <h2 style={{ color: '#ff6939' }}>Giá bán</h2>
                      <div className={homeStyles.price}>
                        <span className={homeStyles.value} style={{ color: '#ff6939' }}>{numeral(lastSell).format('0,0')}</span>
                        <span className={homeStyles.currency}>đ</span>
                        <span className={homeStyles.duration}>{this.props.coin}</span>
                      </div>
                    </header>
                    <footer className={homeStyles.pricingFooter}>
                      <FormGroup style={{ width: '50%', display: 'inline-block', transition: 'all .6s' }}>
                        <InputGroup>
                          <FormControl
                            type="text"
                            onChange={this.handleMaxSell}
                            style={{ backgroundColor: '#404a52', color: 'white', borderColor: 'rgb(51, 199, 23)' }}
                          />
                          <InputGroup.Button>
                            <Button
                              style={{ backgroundColor: 'rgb(51, 199, 23)', borderColor: 'rgb(51, 199, 23)' }}
                            >
                              Tìm
                            </Button>
                          </InputGroup.Button>
                        </InputGroup>
                      </FormGroup>
                    </footer>
                  </ul>
                </div>
              </div>
              <List type="sell"/>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-xs-12" style={{ paddingTop: '20px' }}>
          <div className="row">
            <div className="col-md-12 col-xs-12">
              <OrderForm/>
            </div>
            {
              (this.props.id !== '') ? (
                <div className="col-md-12 col-xs-12">
                  <div className="col-md-12 col-xs-12">
                    <div className="row">
                      <h3 style={{ color: 'white' }}>Các lệnh đang đăng</h3>
                    </div>
                  </div>
                  <div className="col-md-12 col-xs-12">
                    <div className="row">
                      <div className="col-md-6 col-xs-12">
                        <Open type="buy"/>
                      </div>
                      <div className="col-md-6 col-xs-12">
                        <Open type="sell"/>
                      </div>
                    </div>
                  </div>
                </div>
              ) : ''
            }
          </div>
        </div>
      </SwipeableViews>
    </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    coin: getCoin(state),
    slideIndex: getSlideIndex(state),
    rates: getRates(state),
    id: getId(state),
    latest: getLatest(state),
    maxSell: getMaxSell(state),
    maxBuy: getMaxBuy(state),
  };
}

Home.propTypes = {
  dispatch: PropTypes.func.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  latest: PropTypes.object.isRequired,
  maxBuy: PropTypes.number.isRequired,
  maxSell: PropTypes.number.isRequired,
};

Home.contextTypes = {
};

export default connect(mapStateToProps)(Home);
