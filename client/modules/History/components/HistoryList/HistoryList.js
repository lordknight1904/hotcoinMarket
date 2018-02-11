import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl, Button, Table } from 'react-bootstrap';
import { getHistory, getMaxPage, getCurrentPage } from '../../HistoryReducer';
import { setNotify } from '../../../App/AppActions';
import { getCoinList } from '../../../App/AppReducer';
import numeral from 'numeral';
import HistoryDetail from './HistoryDetail';
import historyStyles from '../../historyStyles.css';

class HistoryList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Table className={historyStyles.table} striped bordered condensed hover style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: '8%' }}>Tg. còn lại</th>
            <th style={{ width: '20%' }}>Tài khoản</th>
            <th style={{ width: '4%' }}>Lệnh</th>
            <th style={{ width: '20%' }}>Đối tác</th>
            <th style={{ width: '5%' }}>T.thái</th>
            <th style={{ width: '13%' }}>Thực chi/thu</th>
            <th style={{ width: '10%' }}>Phí mạng</th>
            <th style={{ width: '10%' }}>Phí g.d</th>
            <th style={{ width: '10%' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
        {
          this.props.history.map((m, index) => {
            return (
              <HistoryDetail detail={m} key={index} onDetail={this.props.onDetail} />
            );
          })
        }
        </tbody>
      </Table>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps(state) {
  return {
    history: getHistory(state),
    currentPage: getCurrentPage(state),
    maxPage: getMaxPage(state),
    coinList: getCoinList(state),
  };
}

HistoryList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onDetail: PropTypes.func.isRequired,
  history: PropTypes.array.isRequired,
  coinList: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  maxPage: PropTypes.number.isRequired,
};

HistoryList.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(HistoryList);
