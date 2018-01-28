import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import homeStyles from '../../home.css';
import { changeCoin } from '../../../App/AppActions';
import { getCoin } from '../../../App/AppReducer';
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import CustomForm from './CustomForm';

class OrderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'buy',
    };
  }
  handleSelect = (selectedKey) => {
    this.setState({ type: selectedKey });
  };
  onType = (type) => {
    this.setState({ type });
  };
  render() {
    return (
      <Tab.Container id="left-tabs-example" activeKey={this.state.type} onSelect={() => {}}>
        <Row className="clearfix">
          <Col md={1}>
            <div className={homeStyles.orderPlacerTab}>
              <button
                className={`${this.state.type === 'buy' ? homeStyles.orderPlacerTabBuyActive : ''}`}
                onClick={() => this.onType('buy')}
              >
                Mua
              </button>
              <button
                className={`${this.state.type === 'sell' ? homeStyles.orderPlacerTabSellActive : ''}`}
                onClick={() => this.onType('sell')}
              >
                Bán
              </button>
            </div>
          </Col>
          <Col md={8}>
            <Tab.Content animation>
              <Tab.Pane eventKey="buy">
                <CustomForm type="buy"/>
              </Tab.Pane>
              <Tab.Pane eventKey="sell">
                <CustomForm type="sell"/>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }
}
function mapStateToProps(state) {
  return {
    coin: getCoin(state),
  };
}
OrderForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
OrderForm.contextTypes = {
  router: React.PropTypes.object,
};
export default connect(mapStateToProps)(OrderForm);
