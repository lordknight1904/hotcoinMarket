import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import { getCoin } from '../../App/AppReducer';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import First from '../components/First/First';
import Second from '../components/Second/Second';
import Third from '../components/Third/Third';
import tStyles from '../transaction.css';
import { getTransaction } from '../TransactionReducer';

class Transaction extends Component {
  constructor(props){
    super(props);
    this.state = {
      finished: false,
      stepIndex: 0,
    };
  }

  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };

  getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return <First handleNext={this.handleNext}/>
      case 1:
        return <Second handleNext={this.handleNext}/>
      case 2:
        return <Third/>
      default:
        return 'Error';
    }
  };

  render() {
    const contentStyle = {margin: '0 16px'};
    return (
      <div className={`col-md-12 col-xs-12`}>
        <Stepper activeStep={this.state.stepIndex} style={{ color: 'rgb(206, 210, 187)' }}>
          <Step>
            <StepLabel>Hoàn tất lệnh mua/bán</StepLabel>
          </Step>
          <Step>
            <StepLabel>Đợi đối phương thực hiện thanh toán</StepLabel>
          </Step>
          <Step>
            <StepLabel>Giao dịch đã hoàn tất</StepLabel>
          </Step>
        </Stepper>
        <div className="row">
          {this.state.finished ? (
            <p>
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  this.setState({ stepIndex: 0, finished: false });
                }}
              >
                Click here
              </a> to reset the example.
            </p>
          ) : (
            <div className="col-md-12 col-xs-12">
              {this.getStepContent(this.state.stepIndex)}
            </div>
          )}
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

Transaction.propTypes = {
  dispatch: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
};

Transaction.contextTypes = {
};

export default connect(mapStateToProps)(Transaction);
