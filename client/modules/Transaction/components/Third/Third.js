import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import tStyles from '../../transaction.css';
import { getTransaction } from '../../TransactionReducer';

class Third extends Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }

  render() {
    const transaction = this.props.transaction;
    if (!transaction.hasOwnProperty('type')) return <div></div>;
    const bool = transaction.type === 'buy';
    return (
      <div className="row">
        <div className={`col-md-12 col-xs-12 ${tStyles.textColor} ${tStyles.textCenter}`}>
          Đã hoàn tất giao dịch
        </div>
        <div className={`col-md-12 col-xs-12 ${tStyles.textColor} ${tStyles.textCenter}`}>
          BTC sẽ được chuyển vào ví sau ít phút
        </div>
        <div className={`col-md-12 col-xs-12 ${tStyles.textColor} ${tStyles.textCenter}`}>
          Mã giao dịch BTC: uihsjxhruahkad5h8w734578qdgnrgqk
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    transaction: getTransaction(state),
  };
}

Third.propTypes = {
  dispatch: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
};

Third.contextTypes = {
};

export default connect(mapStateToProps)(Third);
