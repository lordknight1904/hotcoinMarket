import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Import Style
import styles from './App.css';
import { Tabs, Tab } from 'material-ui/Tabs';

// Import Components
import Helmet from 'react-helmet';
import DevTools from './components/DevTools';
import SocketController from './components/SocketController';
import Header from './components/Header/Header';

// Import Actions

import SignInDialog from './components/Auth/SignInDialog';
import SignUpDialog from './components/Auth/SignUpDialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import homeStyles from '../Home/home.css';
import Coin from './components/Coin/Coin';
import {  Modal } from 'react-bootstrap';
import { getIsNotify, getMessage, getCoin, getSlideIndex } from '../App/AppReducer';
import { closeNotify, fetchBanks, fetchRate, fetchLatest, fetchSettings, setSlideIndex } from '../App/AppActions';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMounted: false,
    };
    this.muiThemeSetting = getMuiTheme(null, { userAgent: 'all' });
  }

  componentDidMount() {
    this.setState({isMounted: true}); // eslint-disable-line
    this.props.dispatch(fetchSettings());
    this.props.dispatch(fetchBanks());
    this.props.dispatch(fetchRate('BTC'));
    this.props.dispatch(fetchRate('ETH'));
    this.props.dispatch(fetchRate('LTC'));
    this.props.dispatch(fetchRate('DASH'));
    this.props.dispatch(fetchLatest('BTC'));
    this.props.dispatch(fetchLatest('ETH'));
    this.props.dispatch(fetchLatest('LTC'));
    this.props.dispatch(fetchLatest('DASH'));
  }

  onHide = () => {
    this.props.dispatch(closeNotify());
  };
  handleChange = (value) => {
    // if (this.props.location )
    if (this.props.location.pathname !== '/') {
      this.context.router.push('/');
    }
    this.props.dispatch(setSlideIndex(value));
  };
  render() {
    return (
      <MuiThemeProvider muiTheme={this.muiThemeSetting}>
        <div>
          <Helmet
            title="Chợ Hotcoin"
            meta={[
              { charset: 'utf-8' },
              {
                'http-equiv': 'X-UA-Compatible',
                content: 'IE=edge',
              },
              {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
              },
            ]}
          />
          {this.state.isMounted && !window.devToolsExtension && process.env.NODE_ENV === 'development' && <DevTools />}
          <SocketController />
          <Header />
          <div className="col-md-12 col-xs-12">
            <div className="row">
              <div className="col-md-2 col-xs-12">
                <div className="row">
                  <Tabs
                    className={homeStyles.tabs}
                    onChange={this.handleChange}
                    value={this.props.slideIndex}
                  >
                    <Tab label="Mua/bán" value={0} />
                    <Tab label="Quản lý lệnh" value={1} />
                  </Tabs>
                  <div className={homeStyles.tab}>
                    <Coin name="BTC" />
                    <Coin name="ETH" />
                    <Coin name="LTC" />
                  </div>
                </div>
              </div>
              <div
                className="col-md-10 col-xs-12"
                style={{
                  height: 'calc(100vh - 50px)',
                  backgroundColor: '#3a444d',
                  borderLeft: '2px solid #15232c',
                  borderTop: '2px solid #15232c',
                }}
              >
                {this.props.children}
              </div>
            </div>
          </div>
          <SignInDialog />
          <SignUpDialog />

          <Modal show={this.props.isNotify} onHide={this.onHide}>
            <Modal.Header closeButton>
              <Modal.Title>Thông báo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.props.message}
            </Modal.Body>
          </Modal>

          {/*<ChatFrame />*/}
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isNotify: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  coin: PropTypes.string.isRequired,
  slideIndex: PropTypes.number.isRequired,
};

// Retrieve data from store as props
function mapStateToProps(store) {
  return {
    slideIndex: getSlideIndex(store),
    isNotify: getIsNotify(store),
    message: getMessage(store),
    coin: getCoin(store),
  };
}
App.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(App);
