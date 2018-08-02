import React from 'react';
import { SingleInput } from './SingleInput';

export const NameAndRoomInput = (props) => (
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
export const GameInfo = (props) => {
  return (
    <div>
      <TeamToggle onClick={props.onTeamToggleClick}/>
      <button onClick={()=>props.onResetClick()}>Reset Room</button>
      <button onClick={()=>props.onLeaveRoomClick()}>Leave Room</button>
      <div>You are in room: {props.player.roomName}</div>
      <div>It is {props.room.currentPlayer}'s turn</div>
      <div>The winner is: {props.room.winner}</div>
      <PlayersDisplay player={props.player} players={props.room.players} />
    </div>
  );
}