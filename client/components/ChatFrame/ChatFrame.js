import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import { getChatSocket, getId } from '../../modules/App/AppReducer';


export class ChatFrame extends Component {
  constructor(props) {
    super(props);
  }


  handleOnChat = () => {
    const message = {
      chatGroup: 'chat Group',
      userSend: this.props.id,
      userReceive: this.props.id,
      content: 'hello world'
    };
    this.props.chatSocketObj.emitMessageSent(message);
  };
  render() {
    if (this.props.chatSocketObj === null) return null;
    else {
      console.log(this.props.chatSocketObj)
      return (
        <div style={{
          height: '150px',
          width: '100px',
          position: 'fixed',
          bottom: '50px',
          right: '50px',
          borderStyle: 'ridge'
        }}>
          <FlatButton
            style={{bottom: '0px', zIndex: '10000'}}
            label='Chat'
            onTouchTap={this.handleOnChat}
          />
        </div>
      );
    }
  }
}

ChatFrame.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  chatSocketObj: PropTypes.object,
};

// Retrieve data from store as props
function mapStateToProps(state) {
  return {
    intl: state.intl,
    chatSocketObj: getChatSocket(state),
    id: getId(state),
  };
}

export default connect(mapStateToProps)(ChatFrame);
