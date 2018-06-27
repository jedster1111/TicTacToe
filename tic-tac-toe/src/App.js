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
    };
    this.handlePlayerNameSubmit = this.handlePlayerNameSubmit.bind(this);
    this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    this.handleRoomNameSubmit = this.handleRoomNameSubmit.bind(this);
  }
  componentDidMount(){
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("hello", (rooms) => {
      console.log('we made contact!');
      this.setState({rooms});
    });
    socket.on('game-data',(data) => console.log(data));
  }
  handlePlayerNameChange(e) {
    this.setState({ playerName: e.target.value });
  }
  handlePlayerNameSubmit(e) {
    e.preventDefault();
  }
  handleRoomNameSubmit() {

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
          <input type="submit" value="Submit" />
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
