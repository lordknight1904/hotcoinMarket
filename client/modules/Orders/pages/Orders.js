import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import { getCoin, getUserName } from '../../App/AppReducer';
import { getMyTradingMarket } from '../OrderActions';
import { getTrading } from '../OrderReducer';
import Detail from '../components/Detail/Detail';

class Orders extends Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  componentWillMount() {
    if (this.props.userName === '') {
      this.context.router.push('/');
    }
  }
  componentDidMount() {
    this.props.dispatch(getMyTradingMarket(this.props.coin, this.props.userName));
  }
  render() {
    return (
      <div className={`col-md-12 col-xs-12`}>
        <div className="row">
          <div className="col-md-12 col-xs-12" style={{ padding: '6px 0', color: 'rgb(206, 210, 187)' }}>
            CÁC LỆNH ĐANG GIAO DỊCH
          </div>
          <div className="col-md-12 col-xs-12">
            {
              this.props.trading.map((t, index) => (
                <div className="row" key={index}>
                  <Detail detail={t} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    trading: getTrading(state),
    userName: getUserName(state),
    coin: getCoin(state),
  };
}

Orders.propTypes = {
  dispatch: PropTypes.func.isRequired,
  trading: PropTypes.array.isRequired,
  coin: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

Orders.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Orders);
