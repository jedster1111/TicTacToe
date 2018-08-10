import React, { Fragment } from "react";
import { findBestMatch } from "string-similarity";
import { SingleInput } from "./SingleInput";
import "./Name-Room-Input.css";
import "./GameInfo.css";

const RoomWithJoinButton = props => {
  return (
    <div key={props.containerKey} className={props.containerClass}>
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
export const RoomList = props => {
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
export const NameInput = props => {
  const { playerNameConfirmed, isChangingName, playerName } = props;
  let inputClass = playerNameConfirmed ? "name" : "no-name";
  inputClass +=
    playerName && playerName.trim() !== playerNameConfirmed
      ? " valid"
      : " invalid";
  const containerClass =
    "input-container input-container-name " +
    (playerNameConfirmed ? "name" : "no-name");
  const formClass = "input-form " + (playerNameConfirmed ? "name" : "no-name");
  return (
    <div className={containerClass}>
      {isChangingName ? (
        <Fragment>
          {playerNameConfirmed && (
            <div className="name-text">
              What name would you like <strong>{playerNameConfirmed}</strong>?
            </div>
          )}
          <form onSubmit={props.handlePlayerNameSubmit} className={formClass}>
            <SingleInput
              classes={inputClass}
              title="Player Name"
              name="name"
              controlFunc={props.handlePlayerNameChange}
              content={props.playerName}
              placeholder={"Enter a name!"}
            />
            {playerNameConfirmed !== "" && (
              <button
                type="button"
                className="name-input-button discard invalid"
                onClick={props.handleIsChangeNameFalse}
              >
                Discard Changes
              </button>
            )}
          </form>
        </Fragment>
      ) : (
        <Fragment>
          <div className="name-text">
            Welcome <strong>{playerNameConfirmed}</strong>
          </div>
          <div className="input-form">
            <button
              className="name-input-button"
              onClick={props.handleIsChangeName}
            >
              Change Name
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};
const TeamToggle = props => {
  const { team } = props;
  return (
    <div className="team-toggle">
      <div className="team-buttons-container">
        <button
          className={team === "X" ? "current" : undefined}
          onClick={() => props.handleTeamToggleClick("X")}
        >
          X
        </button>
        <button
          className={team === "O" ? "current" : undefined}
          onClick={() => props.handleTeamToggleClick("O")}
        >
          O
        </button>
      </div>
      <div className="spectate-button-container">
        <button
          className={team === "" ? "current" : undefined}
          onClick={() => props.handleTeamToggleClick("")}
        >
          Spectate
        </button>
      </div>
    </div>
  );
};
const RoomControls = props => {
  return (
    <div className="room-controls-container">
      <button className="reset-room" onClick={props.handleResetClick}>
        Reset Game
      </button>
      <button className="leave-room" onClick={props.handleLeaveRoomClick}>
        Leave Room
      </button>
    </div>
  );
};
export const GameInfo = props => {
  const { playerData } = props;
  return (
    <div className="game-info-container">
      <TeamToggle
        handleTeamToggleClick={props.handleTeamToggleClick}
        team={playerData.team}
      />
      <RoomControls
        handleResetClick={props.handleResetClick}
        handleLeaveRoomClick={props.handleLeaveRoomClick}
      />
    </div>
  );
};
