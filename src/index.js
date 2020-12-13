import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBeezw-yyxDhs1jurdGo-fCfgywb50Wdjo",
  authDomain: "rxublog.firebaseapp.com",
  databaseURL: "https://rxublog-default-rtdb.firebaseio.com",
  projectId: "rxublog",
  storageBucket: "rxublog.appspot.com",
  messagingSenderId: "1089305203848",
  appId: "1:1089305203848:web:0d7ff7266c4c1d96b2fb3d"
};

firebase.initializeApp(config)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
