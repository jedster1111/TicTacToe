import React, { Component } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";

function RoomList(props){
  if(Array.isArray(props.rooms) && props.rooms.length !== 0){
    return(
      <ul>
        {props.rooms.map(room => <li key = {room}>{room}</li>)}
      </ul>
    );
  }
  else{
    return(
      <h1>No rooms yet</h1>
    );
  }
  
}
const SingleInput = (props) => (
  <div>
    <label>{props.title}</label>
    <input
      name={props.name}
      type="text"
      value={props.content}
      onChange={props.controlFunc}
      placeholder={props.placeholder}
    />
    <input type="submit" value="Submit" />
  </div>
);


class GameContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:8000",
      playerName: '',
      roomName: '',
      socket: null,
    };
    this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    this.handlePlayerNameSubmit = this.handlePlayerNameSubmit.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.handleRoomNameSubmit = this.handleRoomNameSubmit.bind(this);
  }
  componentDidMount(){
    this.initSocket();
  }
  initSocket = () => {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("hello", (rooms) => {
      console.log('we made contact!');
      this.setState({ rooms });
    });
    socket.on('game-data', (data) => {
      console.log(data);
    });
    socket.on('rooms', (rooms) =>{
      console.log('received new rooms');
      this.setState({ rooms });
    });
    this.setState({ socket });
    }

  handlePlayerNameChange(e) {
    this.setState({ playerName: e.target.value });
  }
  handleRoomNameChange(e) {
    this.setState({ roomName: e.target.value });
  }
  handlePlayerNameSubmit(e) {
    e.preventDefault();
    this.state.socket.emit('set-name', this.state.playerName);
  }
  handleRoomNameSubmit(e) {
    e.preventDefault();
    this.state.socket.emit('join-room', this.state.roomName);
  }
  render(){
    return(
      <div>
        <RoomList rooms = {this.state.rooms} />
        <form onSubmit={this.handlePlayerNameSubmit}>
          <h5>Player Name Input</h5>
          <SingleInput 
            title = {'Player Name'}
            name = {'playerName'}
            controlFunc = {this.handlePlayerNameChange}
            content={this.state.playerName}
            placeholder={'Enter your player name'}
          />
        </form>
        <form onSubmit={this.handleRoomNameSubmit}>
          <h5>Room Name Input</h5>
          <SingleInput 
            title = {'Room Name'}
            name = {'roomName'}
            controlFunc = {this.handleRoomNameChange}
            content={this.state.roomName}
            placeholder={'Enter your room name'}
          />
        </form>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <GameContainer />
      </div>
    );
  }
}



export default App;
