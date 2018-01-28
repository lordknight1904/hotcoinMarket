import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Pager from 'react-pager';
import Detail from './Detail';
import { getMyBuy, getMySell } from '../../HomeReducer';

class Open extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div
        className="row"
        style={{
          height: 'calc(100vh - 320px)',
          marginLeft: (this.props.type === 'sell') ? '0' : '',
          marginRight: (this.props.type === 'buy') ? '0' : '',
        }}
      >
      {
        (this.props.type === 'buy') ? (
            this.props.myBuy.map((b, index) => (
              <Detail detail={b} key={index} type={this.props.type} />
            ))
          ) : (
            this.props.mySell.map((s, index) => (
              <Detail detail={s} key={index} type={this.props.type} />
            ))
          )
      }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    myBuy: getMyBuy(state),
    mySell: getMySell(state),
  };
}

Open.propTypes = {
  dispatch: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  myBuy: PropTypes.array.isRequired,
  mySell: PropTypes.array.isRequired,
};

Open.contextTypes = {
};

export default connect(mapStateToProps)(Open);
