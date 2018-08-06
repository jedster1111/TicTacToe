import React, { Component, Fragment } from 'react';
import { OldGameInfo, NameAndRoomInput } from './OldGameInfo';
import { RoomInput, NameInput, RoomList, GameInfo } from './GameInfo';
import { Board } from './Board';
import './App.css';
import io from "socket.io-client";
const ENVIRONMENT = process.env.NODE_ENV || 'development';
//console.log(ENVIRONMENT);
(ENVIRONMENT === 'development') && console.log("You are running in DEV mode");

class GameContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      isConnected: false,
      isChangingName: true,
      playerName: '',
      roomName: '',
      rooms: [],
      playerData: {name: '', roomName: null, team: '', id: ''},
      roomData: {squares: Array(9).fill(null), players: [], currentPlayer: null, winner: null},
      socket: null,
    };
    this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    this.handlePlayerNameSubmit = this.handlePlayerNameSubmit.bind(this);
    this.handleIsChangeName = this.handleIsChangeName.bind(this);
    this.handleIsChangeNameFalse = this.handleIsChangeNameFalse.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.handleRoomNameSubmit = this.handleRoomNameSubmit.bind(this);
    this.handleJoinRoomClick = this.handleJoinRoomClick.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handleTeamToggleClick = this.handleTeamToggleClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleLeaveRoomClick = this.handleLeaveRoomClick.bind(this);
  }
  componentDidMount(){
    this.initSocket();
  }
  initSocket = () => {
    let socket;
    if(ENVIRONMENT === 'development'){
      let LOCALIP = process.env.REACT_APP_LOCAL_IP || 'localhost';
      console.log(LOCALIP);
      socket = io(`http://${LOCALIP}:8000`);
    } else {
      socket = io();
    }
    socket.on("hello", (rooms) => {
      console.log('we made contact!');
      this.setState({ rooms, isConnected: true });
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
    socket.on('disconnect', () => {
      console.log('disconnected!!!');
      this.setState({
        isConnected: false,
        isChangingName: true,
        playerName: '',
        roomName: '',
        rooms: [],
        playerData: {name: '', roomName: null, team: '', id: ''},
        roomData: {squares: Array(9).fill(null), players: [], currentPlayer: null, winner: null},
       });
      this.handleIsChangeName();
    });
    this.setState({socket});
  }
  handlePlayerNameChange(e) {
    this.setState({ playerName: e.target.value.replace(/\s{2,}/g,' ').replace(/^\s+/g,'') });
  }
  handleIsChangeName() {
    this.setState({isChangingName: true, playerName: ''})
  }
  handleIsChangeNameFalse() {
    this.setState(({playerData}) => ({isChangingName: false, playerName: playerData.name}));
  }
  handleRoomNameChange(e) {
    this.setState({ roomName: e.target.value.replace(/\s{2,}/g,' ').replace(/^\s+/g,'') });
  }
  handlePlayerNameSubmit(e) {
    e.preventDefault();
    const {playerName, playerData} = this.state;
    const playerNameTrimmed = playerName.trim().replace(/\s{2,}/g,' ').replace(/^\s+/g,'');
    if(playerNameTrimmed !== playerData.name && playerNameTrimmed){
      this.state.socket.emit('set-name', playerNameTrimmed, () => {
        this.setState({isChangingName: false, playerName: playerNameTrimmed})
      });
    } else if(playerData.name && playerNameTrimmed === playerData.name) {
      this.setState({isChangingName: false});
    }
  }
  handleRoomNameSubmit(e) {
    e.preventDefault();
    const { roomName, playerData } = this.state;
    const roomNameTrimmed = roomName.trim().replace(/\s{2,}/g, ' ').replace(/^\s+/g, '');
    if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== '') {
      this.state.socket.emit('join-room', roomNameTrimmed, () => {
        //this.setState({roomName: ''});
      });
    }
  }
  handleJoinRoomClick(e, name) {
    e.preventDefault();
    const {playerData} = this.state;
    const roomNameTrimmed = name.trim().replace(/\s{2,}/g, ' ').replace(/^\s+/g, '');
    if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== '') {
      this.state.socket.emit('join-room', roomNameTrimmed, () => {
        //this.setState({roomName: ''});
      });
    }
  }
  handleSquareClick(i) {
    this.state.socket.emit('new-square', i);
  }
  handleTeamToggleClick(team) {
    this.setState((prevState) => ({playerData: {...prevState.playerData,team:team}}));
    this.state.socket.emit('set-team', team);
  }
  handleResetClick() {
    this.state.socket.emit('reset-game');
  }
  handleLeaveRoomClick() {
    this.state.socket.emit('leave-room');
  }
  renderIsConnected() {
      const isConnected = this.state.isConnected;
      let isConnectedText;
      if(isConnected){
        isConnectedText =
          <div>You are connected</div>;
      } else{
        isConnectedText =
          <div>DISCONNECTED</div>;
      }
      return isConnectedText;
  }
  render(){
    const squares = this.state.roomData.squares;
    const isConnected = this.renderIsConnected();
    const playerNameConfirmed = this.state.playerData.name;
    const roomNameConfirmed = this.state.playerData.roomName;
    const {isChangingName, roomName, rooms} = this.state;
    return (
      <Fragment>
        <div className='name-room-container'>
          <NameInput
            playerNameConfirmed = {playerNameConfirmed}
            isChangingName = {isChangingName} 
            handlePlayerNameChange = {this.handlePlayerNameChange}
            handlePlayerNameSubmit = {this.handlePlayerNameSubmit}
            handleIsChangeName = {this.handleIsChangeName}
            handleIsChangeNameFalse = {this.handleIsChangeNameFalse}
            playerName={this.state.playerName}
          />          
          <RoomInput
            roomNameConfirmed = {roomNameConfirmed}
            handleRoomNameChange = {this.handleRoomNameChange}
            handleRoomNameSubmit = {this.handleRoomNameSubmit}
            handleJoinRoomClick = {this.handleJoinRoomClick}
            roomName = {roomName}
            rooms = {rooms}
          />
        </div>
        <div className='game-container'>
          <Board
              squares={squares}
              onClick = {this.handleSquareClick}
          />
          <GameInfo
            handleTeamToggleClick={this.handleTeamToggleClick}
            handleResetClick={this.handleResetClick}
            handleLeaveRoomClick={this.handleLeaveRoomClick}
            playerData={this.state.playerData}
          />

        </div>

        
        <div>
          {isConnected}
          <RoomList rooms={this.state.rooms} />
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
            <OldGameInfo
              player={this.state.playerData}
              room={this.state.roomData}
              onTeamToggleClick={this.handleTeamToggleClick}
              onResetClick={this.handleResetClick}
              onLeaveRoomClick={this.handleLeaveRoomClick}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

class App extends Component {
  render() {
    return (
        <GameContainer />
    );
  }
}

export default App;
