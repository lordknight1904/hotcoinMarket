/**
 * Client Socket handle
 */
const io = require('socket.io-client');
export default class ChatSocket {
  constructor() {
    this.userID = null;
    this.connected = false;
    // this.socket = io.connect('http://localhost:9000');
    this.socket = io.connect('http://market.hotcoinex.com');
  }

  doConnect(user) {
    this.userID = user.id;
    this.socket.emit('NewUserConnect', user);
    this.connected = true;
  }
  registerUserId(id) {
    this.socket.emit('registerUserId', id);
  }

  disconnect() {
    if (this.connected === true) {
      this.userID = null;
      this.connected = false;
      this.socket.disconnect();
    }
  }

  listening(callback) {
    this.socket.on('updateRate', (message) => {
      callback(message.message);
    });
    this.socket.on('secondPhase', (message) => {
      callback(message);
    });
    this.socket.on('thirdPhase', (message) => {
      callback(message);
    });
    this.socket.on('donePhase', (message) => {
      callback(message);
    });
    this.socket.on('updateMarketList', (message) => {
      callback(message);
    });
    this.socket.on('orderTimeOut', (message) => {
      callback(message);
    });
  }
}
