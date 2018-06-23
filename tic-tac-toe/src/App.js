import React, { Component } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";

class App extends Component {
  constructor(){
    super();
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:8000",
    };
  }

  componentDidMount(){
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
  }


  render() {
    return (
      <div>
        Hello
      </div>
    );
  }
}

export default App;
