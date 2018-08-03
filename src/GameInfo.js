import React, {Fragment} from 'react';
import {findBestMatch} from 'string-similarity';
import {SingleInput} from './SingleInput';

export const RoomList = (props) => {
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
export const RoomInput = (props) => {
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
    const sortArray = (target, strings) => {
        const stringSimilarityMatches = rankStringArray(target, strings);
        const stringsSorted = stringSimilarityMatches.map(
            string => string.target
        );
        return stringsSorted;
    }
  const {roomNameConfirmed, rooms, roomName} = props;
  const roomNameCleaned = roomName.trim();
  const roomsFiltered = rooms.filter(room => room.includes(roomNameCleaned));
  const roomsRemaining = rooms.filter(room => !room.includes(roomNameCleaned));
  const roomsRemainingSorted = sortArray(roomNameCleaned, roomsRemaining);
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
  );
}
export const NameInput = (props) => {
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
