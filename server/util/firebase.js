import * as firebase from "firebase";
import serverConfig from '../config';

firebase.initializeApp(serverConfig.firebaseConfig);

export default firebase;
