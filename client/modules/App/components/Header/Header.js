import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { Navbar, NavItem, NavDropdown, Nav, MenuItem, Glyphicon } from 'react-bootstrap'
import headerStyles from './Header.css';
import { getId, getSignIn, getSignUp, getUserName, getCoin } from '../../AppReducer';
import { onSignUp, onSignIn, logout } from '../../AppActions';

class Header extends Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }

  handleAuth = (selectedKey) => {
    switch (selectedKey) {
      case 'signUp': {
        this.props.dispatch(onSignUp());
        break;
      }
      case 'signIn': {
        this.props.dispatch(onSignIn());
        break;
      }
      default: break;
    }
  };
  onClick = () => {
    this.context.router.push('/');
  };
  handleUser = (selectedKey) => {
    switch (selectedKey) {
      case 'logOut': {
        this.context.router.push('/');
        this.props.dispatch(logout());
        break;
      }
      case 'profile': {
        if (this.props.id === '' ) {
          this.props.dispatch(onSignIn());
        } else {
          this.context.router.push('/profile');
        }
        break;
      }
      case 'wallet': {
        if (this.props.id === '' ) {
          this.props.dispatch(onSignIn());
        } else {
          this.context.router.push('/wallet');
        }
        break;
      }
      case 'orders': {
        if (this.props.id === '' ) {
          this.props.dispatch(onSignIn());
        } else {
          this.context.router.push('/orders');
        }
        break;
      }
      case 'history': {
        if (this.props.id === '' ) {
          this.props.dispatch(onSignIn());
        } else {
          this.context.router.push('/history');
        }
        break;
      }
      default: console.log(selectedKey);
    }
  };
// <a className={headerStyles.tagACursor} onClick={this.onClick}>Chợ Hotcoin</a>
  render() {
    return (
      <Navbar
        inverse
        className={headerStyles.headerStyle}
      >
        <Navbar.Header>
          <Navbar.Brand>
            <a onClick={this.onClick} style={{ padding: '0' }}>
              <img role="presentation" style={{ height: '50px' }} src="/logo/logo.svg" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem>Hotcoin Exchange</NavItem>
          </Nav>
          {
            (this.props.id === '') ? (
              <Nav pullRight onSelect={this.handleAuth}>
                <NavItem eventKey="signIn">Đăng nhập</NavItem>
                <NavItem eventKey="signUp">Đăng ký</NavItem>
              </Nav>
            ) : (
              <Nav pullRight onSelect={this.handleUser}>
                <NavItem eventKey="history">Giao dịch đã hoàn thành</NavItem>
                <NavItem eventKey="orders">Danh sách giao dịch đang thực hiện</NavItem>
                <NavItem eventKey="wallet">Tổng hợp ví</NavItem>
                <NavDropdown title={this.props.userName} id="basic-nav-dropdown">
                  <MenuItem eventKey="profile">Hồ sơ</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey="logOut">Đăng xuất</MenuItem>
                </NavDropdown>
              </Nav>
            )
          }
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

function mapStateToProps(state) {
  return {
    isSignIn: getSignIn(state),
    isSignUp: getSignUp(state),
    userName: getUserName(state),
    coin: getCoin(state),
    id: getId(state),
  };
}
Header.propTypes = {
  dispatch: PropTypes.func,
  isSignIn: PropTypes.bool.isRequired,
  isSignUp: PropTypes.bool.isRequired,
  userName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
Header.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Header);
