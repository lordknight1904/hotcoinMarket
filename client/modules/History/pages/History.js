import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl, Modal, Table } from 'react-bootstrap';
import { Tabs, Tab } from 'material-ui/Tabs';
import { getId, getRates, getCoin, getLatest, getUserName, getCoinList } from '../../App/AppReducer';
import { getHistory, getCurrentPage } from '../HistoryReducer';
import { fetchHistory } from '../HistoryActions';
import HistoryList from '../components/HistoryList/HistoryList';
import numeral from 'numeral';

class History extends Component {
  constructor(props){
    super(props);
    this.state = {
      detail: {},
      time: new Date(),
      start: new Date(),
      isView: false,
    };
  }
  componentWillMount() {
    if (this.props.id === '') {
      this.context.router.push('/');
    }
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
    if (this.props.userName !== '') {
      this.props.dispatch(fetchHistory(this.props.userName, this.props.coin, this.props.currentPage - 1));
    }
  }
  tick = () => {
    this.setState({ time: new Date() });
  };
  onDetail = (detail) => {
    this.setState({ detail, isView: true });
  };
  onHide = () => {
    this.setState({ detail: {}, isView: false });
  };
  onTranslate = (str) => {
    switch (str) {
      case 'open': {
        return 'Mở';
      }
      case 'second': {
        return 'Đã đặt';
      }
      case 'third': {
        return 'Đã tải bằng chứng';
      }
      case 'done': {
        return 'Hoàn tất';
      }
      case 'buy': {
        return 'Mua';
      }
      case 'sell': {
        return 'Bán';
      }
      default: return '~';
    }
  };
  render() {

    const detail = this.state.detail;

    const time = this.state.time;
    const start = new Date(detail.dateSecond);
    const timeLeft = new Date(start - time);
    timeLeft.setHours(timeLeft.getHours() - 7);
    timeLeft.setMinutes(timeLeft.getMinutes() + 15);
    const hours = timeLeft.getHours() < 10 ? `0${timeLeft.getHours()}` : timeLeft.getHours();
    const minutes = timeLeft.getMinutes() < 10 ? `0${timeLeft.getMinutes()}` : timeLeft.getMinutes();
    const seconds = timeLeft.getSeconds() < 10 ? `0${timeLeft.getSeconds()}` : timeLeft.getSeconds();

    const timeStr = `${hours}:${minutes}:${seconds}`;

    const coin = this.props.coinList.filter((c) => { return c.name === detail.coin; });
    const unit = (coin.length > 0) ? coin[0].unit : 0;
    const amount = numeral(detail.amount).value();
    const feeTrade = numeral(detail.feeTrade).value();
    const feeNetwork = numeral(detail.feeNetwork).value();
    return (
      <div className="row">
        <HistoryList onDetail={this.onDetail} />
        <Modal
          show={this.state.isView}
          onHide={this.onHide}
        >
          <Modal.Header>
            <Modal.Title>Thông tin giao dịch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered condensed hover>
              <tbody>
              <tr>
                <td>Người đặt</td>
                <td>{detail.createUser ? detail.createUser.userName : '~'}</td>
              </tr>
              <tr>
                <td>Lệnh</td>
                <td>{this.onTranslate(detail.type)}</td>
              </tr>
              <tr>
                <td>Đồng</td>
                <td>{detail.coin}</td>
              </tr>
              <tr>
                <td>Đối tác</td>
                <td>{detail.userId ? detail.userId.userName : '~'}</td>
              </tr>
              <tr>
                <td>Trạng thái</td>
                <td>{this.onTranslate(detail.stage)}</td>
              </tr>
              <tr>
                <td>Thời gian còn lại</td>
                <td>{(detail.stage !== 'done' || detail.conflict) ? timeStr : '~'}</td>
              </tr>
              <tr>
                <td>Tỉ giá</td>
                <td>{`${numeral(detail.rate).format('0,0')} đ`}</td>
              </tr>
              <tr>
                <td>Số lượng</td>
                <td>{numeral(amount / unit).format('0,0.[000000]')}</td>
              </tr>
              <tr>
                <td>Số lượng thực chuyển</td>
                <td>{numeral((amount - feeNetwork - feeTrade) / unit).format('0,0.[000000]')}</td>
              </tr>
              <tr>
                <td>Phí mạng</td>
                <td>{numeral(feeNetwork / unit).format('0,0.[000000]')}</td>
              </tr>
              <tr>
                <td>Phí giao dịch</td>
                <td>{numeral(feeTrade / unit).format('0,0.[000000]')}</td>
              </tr>
              <tr>
                <td>Bằng chứng chuyển khoản</td>
                <td>
                  {
                    detail.hasOwnProperty('evidenceDir') ? (
                      <div
                        style={{
                          backgroundImage: `url(/public/${detail.evidenceDir})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: 'contain',
                          width: '300px',
                          height: '400px',
                        }}
                      />
                    ) : 'Chưa đang bằng chứng chuyển khoản'
                  }
                </td>
              </tr>
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.onHide}>Thoát</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    history: getHistory(state),
    currentPage: getCurrentPage(state),
    userName: getUserName(state),
    coin: getCoin(state),
    coinList: getCoinList(state),
    rates: getRates(state),
    id: getId(state),
  };
}

History.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.array.isRequired,
  coin: PropTypes.string.isRequired,
  coinList: PropTypes.array.isRequired,
  rates: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  currentPage: PropTypes.number.isRequired,
};

History.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(History);
