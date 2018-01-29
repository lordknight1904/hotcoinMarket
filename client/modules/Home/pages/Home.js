import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import { Tabs, Tab } from 'material-ui/Tabs';
import homeStyles from '../home.css';
import List from '../components/List/List';
import Open from '../components/Open/Open';
import SwipeableViews from 'react-swipeable-views';
import OrderForm from '../components/OrderForm/OrderForm';
import { getBuyMarket, getSellMarket } from '../HomeActions';
import { getId, getRates, getCoin } from '../../App/AppReducer';
import numeral from 'numeral';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      slideIndex: 0,
    };
  }
  handleChange = (value) => {
    this.setState({
      slideIndex: value,
    });
  };
  componentDidMount() {
    this.props.dispatch(getBuyMarket(this.props.coin));
    this.props.dispatch(getSellMarket(this.props.coin));
  }
  render() {
    const rate = this.props.rates[this.props.coin];
    const last = (rate && rate.hasOwnProperty('last')) ? Math.round(rate.last) : 0;
    return (
    <div className="row">
      <Tabs
        className={homeStyles.tabs}
        onChange={this.handleChange}
        value={this.state.slideIndex}
      >
        <Tab label="Mua/bán" value={0} />
        <Tab label="Quản lý lệnh" value={1} />
      </Tabs>
      <SwipeableViews
        index={this.state.slideIndex}
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
                        <span className={homeStyles.currency}>$</span>
                        <span className={homeStyles.value} style={{ color: 'rgb(51, 199, 23)' }}>{numeral(last).format('0,0')}</span>
                        <span className={homeStyles.duration}>{this.props.coin}</span>
                      </div>
                    </header>
                    <footer className={homeStyles.pricingFooter}>
                      <FormGroup style={{ width: '50%', display: 'inline-block', transition: 'all .6s' }}>
                        <InputGroup>
                          <FormControl type="text" style={{ backgroundColor: '#404a52', color: 'white', borderColor: '#ff6939' }} />
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
                        <span className={homeStyles.currency}>$</span>
                        <span className={homeStyles.value} style={{ color: '#ff6939' }}>{numeral(last).format('0,0')}</span>
                        <span className={homeStyles.duration}>{this.props.coin}</span>
                      </div>
                    </header>
                    <footer className={homeStyles.pricingFooter}>
                      <FormGroup style={{ width: '50%', display: 'inline-block', transition: 'all .6s' }}>
                        <InputGroup>
                          <FormControl type="text" style={{ backgroundColor: '#404a52', color: 'white', borderColor: 'rgb(51, 199, 23)' }} />
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
    rates: getRates(state),
    id: getId(state),
  };
}

Home.propTypes = {
  dispatch: PropTypes.func.isRequired,
  coin: PropTypes.string.isRequired,
  rates: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

Home.contextTypes = {
};

export default connect(mapStateToProps)(Home);
