import React from "react";
import { NameInput } from "./NameInput";
import { RoomInput } from "./RoomInput";

export const NameAndRoomInputContainer = props => {
  return (
    <div className="name-room-container">
      <NameInput
        playerNameConfirmed={props.playerNameConfirmed}
        isChangingName={props.isChangingName}
        handlePlayerNameChange={props.handlePlayerNameChange}
        handlePlayerNameSubmit={props.handlePlayerNameSubmit}
        handleIsChangeName={props.handleIsChangeName}
        handleIsChangeNameFalse={props.handleIsChangeNameFalse}
        playerName={props.playerName}
      />
      <RoomInput
        roomNameConfirmed={props.roomNameConfirmed}
        handleRoomNameChange={props.handleRoomNameChange}
        handleRoomNameSubmit={props.handleRoomNameSubmit}
        handleJoinRoomClick={props.handleJoinRoomClick}
        roomName={props.roomName}
        rooms={props.rooms}
      />
    </div>
  );
};
