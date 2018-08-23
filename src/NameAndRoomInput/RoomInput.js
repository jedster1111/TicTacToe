import React from "react";
import { findBestMatch } from "string-similarity";
import { SingleInput } from "../SingleInput";
import "./Name-Room-Input.css";

const RoomWithJoinButton = props => {
  return (
    <div className={props.containerClass}>
      {props.rooms.map(room => {
        const isJoinedRoom = room === props.roomNameConfirmed;
        const containerClass = isJoinedRoom
          ? "confirmed-room room-list"
          : "room-list";
        const buttonClass = isJoinedRoom ? "confirmed" : "";
        const buttonText = isJoinedRoom ? "Joined" : "Join";
        return (
          <div key={room} className={containerClass}>
            <div className="room-list-text">{room}</div>
            <button
              onClick={e => props.handleJoinRoomClick(e, room)}
              className={buttonClass}
            >
              {buttonText}
            </button>
          </div>
        );
      })}
    </div>
  );
};
const RoomList = props => {
  let roomList = [];
  if (Array.isArray(props.roomsFiltered) && props.roomsFiltered.length !== 0) {
    roomList.push(
      <RoomWithJoinButton
        key="roomsFiltered"
        containerKey="roomsFiltered"
        containerClass="rooms-filtered"
        rooms={props.roomsFiltered}
        roomNameConfirmed={props.roomNameConfirmed}
        handleJoinRoomClick={props.handleJoinRoomClick}
      />
    );
  }
  if (
    Array.isArray(props.roomsRemaining) &&
    props.roomsRemaining.length !== 0
  ) {
    roomList.push(
      <RoomWithJoinButton
        key="roomsRemaining"
        containerKey="roomsRemaining"
        containerClass="rooms-remaining"
        rooms={props.roomsRemaining}
        roomNameConfirmed={props.roomNameConfirmed}
        handleJoinRoomClick={props.handleJoinRoomClick}
      />
    );
  }
  if (Array.isArray(roomList) && roomList.length !== 0) {
    return <div className="room-list-container">{roomList}</div>;
  } else {
    return <h4 className="room-text">No rooms yet</h4>;
  }
};
export const RoomInput = props => {
  const rankStringArray = (target, strings) => {
    if (Array.isArray(strings) && strings.length !== 0) {
      return findBestMatch(target, strings).ratings.sort((a, b) => {
        return b.rating - a.rating;
      });
    } else {
      return [];
    }
  };
  const sortArray = (target, strings) => {
    const stringSimilarityMatches = rankStringArray(target, strings);
    const stringsSorted = stringSimilarityMatches.map(string => string.target);
    return stringsSorted;
  };
  const { roomNameConfirmed, rooms, roomName } = props;
  const roomNameCleaned = roomName.trim();
  const roomsFiltered = rooms.filter(room => room.includes(roomNameCleaned));
  const roomsRemaining = rooms.filter(room => !room.includes(roomNameCleaned));
  const roomsRemainingSorted = sortArray(roomNameCleaned, roomsRemaining);
  const submitText =
    roomsFiltered.indexOf(roomNameCleaned) === -1
      ? "Create"
      : roomNameCleaned !== roomNameConfirmed
        ? "Join"
        : "Joined";
  let inputClass = roomNameConfirmed ? `room` : `no-room`;
  inputClass +=
    roomName && roomNameCleaned !== roomNameConfirmed ? " valid" : " invalid";
  inputClass += ` ${submitText.toLowerCase()}`;
  const containerClass =
    "input-container input-container-room " +
    (roomNameConfirmed ? "room" : "no-room");
  const formClass = "input-form " + (roomNameConfirmed ? "room" : "no-room");
  return (
    <div className={containerClass}>
      <form onSubmit={props.handleRoomNameSubmit} className={formClass}>
        <SingleInput
          classes={inputClass}
          title="Room Name"
          name="roomName"
          submitText={submitText}
          controlFunc={props.handleRoomNameChange}
          content={props.roomName}
          placeholder={"Enter a room!"}
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
};