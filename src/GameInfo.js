import React from "react";
import "./GameInfo.css";

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
const filterPlayers = (players, teamName, playerData) => {
  const isPlayersEmpty = players.length === 0;
  const filtered = !isPlayersEmpty
    ? players.filter(player => player.team === teamName)
    : playerData.team === teamName
      ? [{ name: playerData.name, team: teamName }]
      : [];
  return filtered;
};
const renderTeam = (players, teamName, playerData) => {
  return (
    <div className="player-list">
      <span className="player-list-text">{teamName}</span>
      {players.length !== 0 ? (
        players.map(player => {
          const classes =
            player.id === playerData.id || !player.id
              ? "player"
              : "other-players";
          return (
            <div className={classes} key={player.id || playerData.id}>
              {player.name || "Unnamed Player"}
            </div>
          );
        })
      ) : (
        <div className="empty">empty</div>
      )}
    </div>
  );
};
const PlayerList = props => {
  const { players, playerData, team } = props;
  const xPlayers = filterPlayers(players, "X", playerData);
  const oPlayers = filterPlayers(players, "O", playerData);
  const spectators = filterPlayers(players, "", playerData);
  return (
    <div className="player-list-container">
      <div className="X-O-teams">
        {renderTeam(xPlayers, "X", playerData)}
        {renderTeam(oPlayers, "O", playerData)}
      </div>
      {renderTeam(spectators, "Spectating", playerData)}
    </div>
  );
};
export const GameInfo = props => {
  const {
    playerData,
    players,
    handleResetClick,
    handleLeaveRoomClick,
    team
  } = props;
  return (
    <div className="game-info-container">
      <TeamToggle
        handleTeamToggleClick={props.handleTeamToggleClick}
        team={team}
      />
      <RoomControls
        handleResetClick={handleResetClick}
        handleLeaveRoomClick={handleLeaveRoomClick}
      />
      <PlayerList players={players} playerData={playerData} team={team} />
    </div>
  );
};
