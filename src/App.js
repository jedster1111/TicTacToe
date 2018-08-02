import React, { Component, Fragment } from 'react';
import './App.css';
import io from "socket.io-client";
import {findBestMatch} from "string-similarity";
import {} from 'react-spring';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
//console.log(ENVIRONMENT);
(ENVIRONMENT === 'development') && console.log("You are running in DEV mode");

const SingleInput = (props) => {
  let inputClass = 'single-input-text-box';
  let submitClass = 'single-input-submit-button';
  let submitText = props.submitText || 'Submit';
  if(props.classes){
    inputClass += ' ' + props.classes;
    submitClass += ' ' + props.classes;
  }
  return(
    <React.Fragment>
      <input
        name={props.name}
        type="text"
        value={props.content}
        onChange={props.controlFunc}
        placeholder={props.placeholder}
        className={inputClass}
        autoComplete='off'
        maxLength={30}
      />
      <input type="submit" value={submitText} className = {submitClass}/>
    </React.Fragment>
  )
}
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
    <button onClick={() => props.onClick('')}>Spectate</button>
  </div>
)
const TeamList = (props) => (
    props.team.map(player => <li key={player.id}>{player.name}</li>)
);
const PlayersDisplay = (props) => {
  let player = props.player;
  let XTeam = []; 
  let OTeam = [];
  let noTeam = [];
  if(props.players.length > 0){
    XTeam = props.players.filter(player => player.team === 'X');
    OTeam = props.players.filter(player => player.team === 'O');
    noTeam = props.players.filter(player => player.team === '');
  }
  else{
    switch(player.team){
      case 'X':
        XTeam.push(player)
        break;
      case 'O':
        OTeam.push(player)
        break;
      case '':
        noTeam.push(player)
        break;
      default:
        console.log('Invalid team');
        break;
    }
  }
  return(
    <div>
      X players
      <ul>
        <TeamList team={XTeam} />
      </ul>
      O players
      <ul>
        <TeamList team={OTeam} />
      </ul>
      Spectators
      <ul>
        <TeamList team={noTeam} />
      </ul>
    </div>
  );
}
class GameInfo extends Component{
  render(){
    return (
      <div>
        <TeamToggle onClick={this.props.onTeamToggleClick}/>
        <button onClick={()=>this.props.onResetClick()}>Reset Room</button>
        <button onClick={()=>this.props.onLeaveRoomClick()}>Leave Room</button>
        <div>You are in room: {this.props.player.roomName}</div>
        <div>It is {this.props.room.currentPlayer}'s turn</div>
        <div>The winner is: {this.props.room.winner}</div>
        <PlayersDisplay player={this.props.player} players={this.props.room.players} />
      </div>
    );
  }
}
const Square = (props) => (
    <button className = "square" onClick={props.onClick}>
      {props.value}
    </button>
)
class Board extends Component{
  renderSquare = (i) => {
    return(
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
    return (
      <div>
        {this.createTable()}
      </div>
    );
  }
}
const NameInput = (props) => {
  const {playerNameConfirmed, isChangingName, playerName} = props;
  const inputClass = playerNameConfirmed ? (playerNameConfirmed === playerName ? 'name same-name' : 'name') : 'no-name';
  const containerClass = 'input-container input-container-name ' + (playerNameConfirmed ? 'name' : 'no-name');
  const formClass = 'input-form ' + (playerNameConfirmed ? 'name' : 'no-name');
  return(
    <div className = {containerClass}>
      {isChangingName ?
        <Fragment>
          {playerNameConfirmed && <div className='name-text'>What name would you like <strong>{playerNameConfirmed}</strong>?</div>}
            <form onSubmit={props.handlePlayerNameSubmit} className={formClass}>              
              <SingleInput 
                classes = {inputClass}
                title = 'Player Name'
                name='name'
                controlFunc = {props.handlePlayerNameChange}
                content={props.playerName}
                placeholder={'Enter a name!'}
              />
              {playerNameConfirmed !== '' && 
                <button type='button' className='name-input-button leave' onClick={props.handleIsChangeNameFalse}>Discard Changes</button>
              }
            </form>
        </Fragment>
      :
        <Fragment>
          <div className='name-text'>
            Welcome <strong>{playerNameConfirmed}</strong>
          </div>
          <div className='input-form'>
            <button className='name-input-button' onClick={props.handleIsChangeName}>Change name</button>
          </div>
        </Fragment>
      }
    </div>
  )
}
const RoomList = (props) => {
  let roomList = [];
  if(Array.isArray(props.roomsFiltered) && props.roomsFiltered.length !== 0){
    roomList.push(
      <div key='roomsFiltered' className='rooms-filtered'>
        {props.roomsFiltered.map((room) => {
          const containerClass = room === props.roomNameConfirmed ? 'confirmed-room room-list' : 'room-list';
          const buttonClass = room === props.roomNameConfirmed ? 'confirmed-room-button' : 'room-button';
          const buttonText = room === props.roomNameConfirmed ? 'Joined' : 'Join';
          return(
            <div key={room} className={containerClass}>
              <div className='room-list-text'>{room}</div>
              <button onClick={(e)=>props.handleJoinRoomClick(e, room)} className={buttonClass}>{buttonText}</button>
            </div>
          )
        })}
      </div>
    )
  }
  if(Array.isArray(props.roomsRemaining) && props.roomsRemaining.length !== 0) {
    roomList.push(
      <div key='roomsRemaining' className='rooms-remaining'>
        {props.roomsRemaining.map((room) => {
          const containerClass = room === props.roomNameConfirmed ? 'confirmed-room room-list' : 'room-list';
          const buttonClass = room === props.roomNameConfirmed ? 'confirmed-room-button' : 'room-button';
          const buttonText = room === props.roomNameConfirmed ? 'Joined' : 'Join';
          return(
            <div key={room} className={containerClass}>
              <div className='room-list-text'>{room}</div>
              <button onClick={(e)=>props.handleJoinRoomClick(e, room)}  className={buttonClass}>{buttonText}</button>
            </div>
          )
        })}
      </div>
    )
  }
  if(Array.isArray(roomList) && roomList.length !== 0){
    return <div className='room-list-container'>{roomList}</div>
  }
  else{
    return <h4 className='room-text'>No rooms yet</h4>
  }
}
const RoomInput = (props) => {
  const rankStringArray = (target, strings) => {
    if(Array.isArray(strings) && strings.length !== 0){
      return(
        findBestMatch(target, strings).ratings.sort(
          (a,b) => {return(b.rating - a.rating)}
        )
      )
    } else {
      return(
        []
      )
    }
  }
  const {roomNameConfirmed, rooms, roomName} = props;
  const roomNameCleaned = roomName.trim();
  const roomsFiltered = rooms.filter(room => room.includes(roomNameCleaned));
  const roomsRemaining = rooms.filter(room => !room.includes(roomNameCleaned));
  const stringSimilarityMatches = rankStringArray(roomNameCleaned, roomsRemaining);
  const roomsRemainingSorted = stringSimilarityMatches.map(
    word => word.target
  );
  const submitText = roomsFiltered.indexOf(roomNameCleaned) === -1 ? 'Create' : (roomNameCleaned !== roomNameConfirmed ? 'Join' : 'Joined');
  const inputClass = roomNameConfirmed ? `room ${submitText.toLowerCase()}` : `no-room ${submitText.toLowerCase()}`;
  const containerClass = 'input-container input-container-room ' + (roomNameConfirmed ? 'room' : 'no-room');
  const formClass = 'input-form ' + (roomNameConfirmed ? 'room' : 'no-room');
 
  return(
    <div className={containerClass}>
      <form onSubmit={props.handleRoomNameSubmit} className={formClass}>
        <SingleInput
          classes = {inputClass}
          title = 'Room Name'
          name = 'roomName'
          submitText = {submitText}
          controlFunc = {props.handleRoomNameChange}
          content = {props.roomName}
          placeholder = {'Enter a room!'}
        />
        <RoomList
          rooms={rooms}
          roomsFiltered={roomsFiltered}
          roomsRemaining={roomsRemainingSorted}
          roomNameConfirmed={roomNameConfirmed}
          handleJoinRoomClick={props.handleJoinRoomClick}
        />
      </form>
    </div>
  )
}
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
    if(playerNameTrimmed !== playerData.name && playerNameTrimmed !== ''){
      this.state.socket.emit('set-name', playerNameTrimmed, () => {
        this.setState({isChangingName: false, playerName: playerNameTrimmed})
      });
    } else {
      console.log('name is empty or the same')
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
        <div className='game-container'>
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
            <GameInfo
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
