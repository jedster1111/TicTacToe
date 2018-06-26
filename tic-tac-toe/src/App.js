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

  socket.on("hello", () => {
    console.log('we made contact!');
    socket.emit('set-name', 'jed');
    socket.emit('join-room', 'testRoom');
    socket.emit('set-team','X');
    socket.emit('new-square', 0);
    socket.emit('set-team', 'O');
    socket.emit('new-square', 1);

  });

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
