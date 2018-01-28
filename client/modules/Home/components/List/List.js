import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Pager from 'react-pager';

import Detail from './Detail';
import { getBuy, getSell } from '../../HomeReducer';

class List extends Component {
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
          position: 'relative',
          width: '90%',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: 'calc(100vh - 227px)'
        }}
      >
        {
          (this.props.type === 'buy') ? (
            this.props.buy.map((b, index) => (
              <Detail detail={b} key={index} type={this.props.type} />
            ))
          ) : (
            this.props.sell.map((s, index) => (
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
    buy: getBuy(state),
    sell: getSell(state),
  };
}

List.propTypes = {
  dispatch: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  buy: PropTypes.array.isRequired,
  sell: PropTypes.array.isRequired,
};

List.contextTypes = {
};

export default connect(mapStateToProps)(List);
