/**
 * Use to define constants to use at global scope
 */

global.TesseVideoCallActionTypes = {
  REQUEST_CALL_CANCEL: 'REQUEST_CALL_CANCEL', // Caller Cancel the call
  REQUEST_CALL: 'REQUEST_CALL', // Caller request a call
  REQUEST_CHECK_USER_READY: 'REQUEST_CHECK_USER_READY', // Check user receive the call is free of call
  USER_IS_BUSY: 'USER_IS_BUSY',
  USER_IS_READY: 'USER_IS_READY',
  USER_CANCEL_CALL: 'USER_CANCEL_CALL',
  USER_ACCEPT_CALL: 'USER_ACCEPT_CALL',
  USER_WINDOW_END_CALL: 'USER_WINDOW_END_CALL',
  USER_END_CALL: 'USER_END_CALL',
  FILE_UPLOADED: 'FILE_UPLOADED',
  HAVE_USER_ACCEPT_REQUEST: 'HAVE_USER_ACCEPT_REQUEST'
};

global.TesseVideoCallActions = {
  CLIENT: {
    REQUEST_CALL: 'CLIENT_REQUEST_CALL',
    RESPONSE_CALL: 'CLIENT_RESPONSE_CALL'
  },
  SERVER: {
    REQUEST_CALL: 'SERVER_REQUEST_CALL',
    RESPONSE_CALL: 'SERVER_RESPONSE_CALL',
    RESPONSE: 'SERVER_RESPONSE'
  }
};

global.UserState = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY',
  READY: 'READY'
};

// Chat file upload configs
global.chatMaxFileSize = 10485760; // In bytes <=> 10MB
global.chatMaxFiles = 10;
global.fileTypeAccept = [];
// Set timeout for socketIO leave
global.socketSessionTimeout = 30000; // In ms
global.peerCallWaitingTime  = 60000; // In ms, time waiting for receiver answer the call
