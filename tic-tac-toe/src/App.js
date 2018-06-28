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

const NameAndRoomInput = (props) => (
  <div>
        <form onSubmit={props.handlePlayerNameSubmit}>
          <h5>Player Name Input</h5>
          <SingleInput 
            title = {'Player Name'}
            name = {'playerName'}
            controlFunc = {props.handlePlayerNameChange}
            content={props.playerName}
            placeholder={'Enter your player name'}
          />
        </form>
        <form onSubmit={props.handleRoomNameSubmit}>
          <h5>Room Name Input</h5>
          <SingleInput 
            title = {'Room Name'}
            name = {'roomName'}
            controlFunc = {props.handleRoomNameChange}
            content= {props.roomName}
            placeholder={'Enter your room name'}
          />
        </form>
      </div>
)

const TeamToggle = (props) => (
  <div>
    <button onClick={() => props.onClick('X')}>X</button>
    <button onClick={() => props.onClick('O')}>O</button>
    <button onClick={() => props.onClick(null)}>Spectate</button>
  </div>
)

class GameInfo extends Component{
  render(){
    return(
      <div>
        <TeamToggle onClick={this.props.onClick}/>
        <div>You are in room: {this.props.player.roomName}</div>
        <div>It is {this.props.room.currentPlayer}'s turn</div>
        <div>The winner is: {this.props.room.winner}</div>
      </div>
    )
  }
}

const Square = (props) => (
  <button className = "square" onClick={props.onClick}>
    {props.value}
  </button>
)

class Board extends Component{
  renderSquare = (i) => {
    return (
      <Square 
        value = {this.props.squares[i]}
        key = {i}
        onClick = {() => this.props.onClick(i)}
      />
    );
  }
  createTable = () => {
    let rows = [];
    for(let i=0; i<3; i++){
      let columns = [];
      for(let j=0; j<3; j++){
        columns.push(this.renderSquare(j+(i*3)));
      }
      rows.push(
        <div className="board-row" key={i}>
          {columns}
        </div>
      );
    }
    return rows;
  }
  render(){
    return(
      <div>
        {this.createTable()}
      </div>
    );
  }
}

class GameContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:8000",
      playerName: '',
      roomName: '',
      playerData: {},
      roomData: {squares: Array(9).fill(null)},
      socket: null,
    };
    this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    this.handlePlayerNameSubmit = this.handlePlayerNameSubmit.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.handleRoomNameSubmit = this.handleRoomNameSubmit.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handleTeamToggleClick = this.handleTeamToggleClick.bind(this);
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
    socket.on('game-data', (roomData) => {
      console.log(roomData);
      this.setState({ roomData });
    });
    socket.on('player-data', (playerData) => {
      console.log(playerData);
      this.setState({ playerData });
    });
    socket.on('rooms', (rooms) =>{
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
  handleSquareClick(i) {
    this.state.socket.emit('new-square', i);
  }
  handleTeamToggleClick(team) {
    this.state.socket.emit('set-team', team);
  }

  render(){
    let squares = this.state.roomData.squares;
    return(
      <div>
        <RoomList rooms = {this.state.rooms} />
        <NameAndRoomInput
          handlePlayerNameChange = {this.handlePlayerNameChange}
          handlePlayerNameSubmit = {this.handlePlayerNameSubmit}
          playerName = {this.state.playerName}
          handleRoomNameChange = {this.handleRoomNameChange}
          handleRoomNameSubmit = {this.handleRoomNameSubmit}
          roomName = {this.state.roomName}
        />
        <div>
        <Board squares = {squares} onClick = {this.handleSquareClick}/>
        <GameInfo player={this.state.playerData} room={this.state.roomData} onClick={this.handleTeamToggleClick} />
        </div>
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
