import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Button, Form, FormGroup, Col, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { onCloseSign, createUser, setNotify } from '../../AppActions';
import { getSignUp } from '../../AppReducer';

class SignUpDialog extends Component{
  constructor(props){
    super(props);
    this.state = {
      email: '',
      userName: '',
      password: '',

      emailError: '',
      userNameError: '',
      passwordError: '',

      isSigningUp: false,
    };
  }
  validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  onHide = () => {
    this.props.dispatch(onCloseSign());
  };
  onSigningUp = () => {
    if (
      this.state.email !== '' &&
      this.state.userName !== '' &&
      this.state.password !== '' &&
      this.state.emailError === '' &&
      this.state.userNameError === '' &&
      this.state.passwordError === ''
    ) {
      const user = {
        email: this.state.email,
        userName: this.state.userName,
        password: this.state.password,
      };
      this.setState({ isSigningUp: true });
      this.props.dispatch(createUser(user)).then((res) => {
        this.setState({ isSigningUp: false });
        this.props.dispatch(onCloseSign());
        if (res.user.code === 'success') {
          this.props.dispatch(setNotify('Đăng ký thành công. \n Vui lòng kiểm tra hòm thư để kích hoạt tài khoản.'));
        } else {
          this.props.dispatch(setNotify('Tài khoản đã tồn tại.'));
        }
      });
    } else {
      if (this.state.email === '') {
        this.setState({ emailError: 'Input your Email.' });
      }
      if (this.state.userName === '') {
        this.setState({ userNameError: 'Input your account name' });
      }
      if (this.state.password === '') {
        this.setState({ passwordError: 'Input your password' });
      }
    };
  };
  handleEmail = (event) => {
    if (event.target.value.trim() === '') {
      this.setState({email: event.target.value.trim(), emailError: 'This field cannot be empty.'});
    } else {
      if (this.validateEmail(event.target.value.trim())) {
        this.setState({email: event.target.value.trim(), emailError: ''});
      } else {
        this.setState({email: event.target.value.trim(), emailError: 'Wrong Email format.'});
      }
    }
  };
  handleUserName = (event) => {
    this.setState({ userName: event.target.value });
  };
  handlePassword = (event) => {
    if (event.target.value.trim() === '') {
      this.setState({ password: event.target.value.trim(), passwordError: 'This field cannot be empty.' });
    } else {
      this.setState({ password: event.target.value.trim(), passwordError: '' });
    }
  };
  handleEmailBlur = (event) => {
    if (event.target.value.trim() === '') {
      this.setState({ emailError: 'This field cannot be empty.'});
    } else {
      if (this.validateEmail(event.target.value.trim())) {
        this.setState({ emailError: ''});
      } else {
        this.setState({ emailError: 'Wrong Email format.'});
      }
    }
  };
  handleUserNameBlur = (event) => {
    if (event.target.value.trim() === '') {
      this.setState({ userNameError: 'This field cannot be empty.'});
    } else {
      this.setState({ userNameError: ''});
    }
  };
  handlePasswordBlur = (event) => {
    if (event.target.value.trim() === '') {
      this.setState({ passwordError: 'This field cannot be empty.'});
    } else {
      this.setState({ passwordError: ''});
    }
  };
  render(){
    return (
      <Modal show={this.props.isSignUp}>
        <Modal.Header style={{ backgroundColor: '#2f3d45' }}>
          <Modal.Title style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Đăng ký</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="formHorizontalEmail" validationState={(this.state.emailError !== '') ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>Email</Col>
              <Col sm={9}>
                <FormControl type="email" value={this.state.email} onChange={this.handleEmail} onBlur={this.handleEmailBlur} />
                <HelpBlock>{this.state.emailError}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup controlId="formHorizontalUserName" validationState={(this.state.userNameError !== '') ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>Tên tài khoản</Col>
              <Col sm={9}>
                <FormControl type="text" value={this.state.userName} onChange={this.handleUserName} onBlur={this.handleUserNameBlur} />
                <HelpBlock>{this.state.userNameError}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup controlId="formHorizontalPassword" validationState={(this.state.passwordError !== '') ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>Mật khẩu</Col>
              <Col sm={9}>
                <FormControl type="password" value={this.state.password} onChange={this.handlePassword} onBlur={this.handlePasswordBlur} />
                <HelpBlock>{this.state.passwordError}</HelpBlock>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#2f3d45', textAlign: 'center' }}>
          <Button onClick={this.onSigningUp} bsStyle="success" disabled={this.state.isSigningUp}>
            {(this.state.isSigningUp) ? 'Đang gửi' : 'Gửi'}
          </Button>
          <Button onClick={this.onHide} bsStyle="danger" disabled={this.state.isSigningUp}>
            {(this.state.isSigningUp) ? 'Đang gửi' : 'Đóng'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}


function mapStateToProps(state) {
  return {
    isSignUp: getSignUp(state),
  };
}
SignUpDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
SignUpDialog.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(SignUpDialog);
