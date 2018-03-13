import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { confirmUser } from '../UserActions';
import appStyles from '../../App/App.css';


class Confirm extends Component{
  constructor(props){
    super(props);
    this.state = {
      message: ''
    };
  }
  componentDidMount() {
    const token = this.props.location.query.token ? this.props.location.query.token : '';
    if (token) {
      this.props.dispatch(confirmUser(this.props.location.query.token)).then((res) => {
        this.setState({ message: res.user });
      });
    }
    this.timer = setTimeout(this.tick, 5000);
  }
  tick = () => {
    this.context.router.push('/');
  };
  translate = (str) => {
    switch (str) {
      case 'Activated': return 'Kích hoạt thành công';
      default: return str;
    }
  };
  render(){
    return (
      <div className={appStyles.container} style={{ marginTop: '0' }}>
        {this.translate(this.state.message)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}
Confirm.propTypes = {
  dispatch: PropTypes.func,
};
Confirm.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(Confirm);
