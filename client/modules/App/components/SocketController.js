/**
 * Use to control chatSocketObj when user login/logout/page load
 * Not render any things
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import { getId, getUserName, getCoin } from '../../App/AppReducer';
import { setSocket, updateRate } from '../AppActions';
import { getSocket } from '../AppReducer';
import ChatSocket from '../../../util/ChatSocket';
import { getBuyMarket, getSellMarket, getMySellMarket, getMyBuyMarket } from '../../Home/HomeActions';

export class SocketController extends Component {
  componentDidMount() {
    console.log('SocketController');
    Promise.resolve(this.props.dispatch(setSocket(new ChatSocket()))).then(() => {
      this.isDidMount = true;
      this.props.socketIO.listening((message) => {
        switch (message.code) {
          case 'updateRate': {
            this.props.dispatch(updateRate(message));
            break;
          }
          case 'secondPhase': {
            this.props.dispatch(getBuyMarket(this.props.coin));
            this.props.dispatch(getSellMarket(this.props.coin));
            this.props.dispatch(getMyBuyMarket(this.props.coin, this.props.userName));
            this.props.dispatch(getMySellMarket(this.props.coin, this.props.userName));
            break;
          }
          case 'updateMarketList': {
            this.props.dispatch(getBuyMarket(this.props.coin));
            this.props.dispatch(getSellMarket(this.props.coin));
            break;
          }
          default: {
            break;
          }
        }
      });
    });
  }

  render() {
    return null;
  }

  componentWillReceiveProps(props) {
    if (this.isDidMount === false) {
      return;
    }
    const userId = (props.id === '') ? 'guest' : props.id;
    if (userId !== this.previousUserLoginID) {
      this.connectToServer(props, userId);
    }
  }
  componentWillUnmount = () => {
    clearInterval(this.timer);
  };

  tick = () => {
    this.props.dispatch(getHold(this.props.userName, this.props.coin));
  };

  connectToServer(props, userId) {
    props.socketIO.doConnect({ id: userId });
    props.dispatch(setSocket(props.socketIO));
    this.previousUserLoginID = userId;
  }

  handleLogout(props) {
    props.socketIO.disconnect();
    props.dispatch(setSocket(props.socketIO));
  }
  render() {
    return null;
  }
}
SocketController.propTypes = {
  dispatch: PropTypes.func.isRequired,
  socketIO: PropTypes.object.isRequired,
  coin: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
// Retrieve data from store as props
function mapStateToProps(state) {
  return {
    id: getId(state),
    userName: getUserName(state),
    coin: getCoin(state),
    socketIO: getSocket(state),
  };
}

export default connect(mapStateToProps)(SocketController);
