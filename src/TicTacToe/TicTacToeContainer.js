import React, { Component } from "react";
import { GameInfo } from "../GameInfo";
import { NameInput } from "../NameAndRoomInput/NameInput";
import { RoomInput } from "../NameAndRoomInput/RoomInput";
import { ConnectionStatus } from "../ConnectionStatus";
import { BoardContainer } from "../Board/Board";
import { calculateWinner } from "../calculateWinner";
import { ChatRoom } from "../ChatRoom";
import { initSocket } from "./initSocket";
import { withSocket } from "../withSocketHOC";
const uuid = require("uuid/v1");

export class TicTacToeContainer extends Component {
  constructor(props) {
    super(props);
    const playerName = sessionStorage.getItem("playerName") || "";
    this.state = {
      connectionStatus: "connecting",
      showConnectionStatus: true,
      isChangingName: playerName === "",
      playerName: playerName,
      roomName: "",
      rooms: [],
      playerData: { name: playerName, roomName: "", team: "X", id: "" },
      roomData: {
        squares: Array(9).fill(null),
        players: [],
        currentPlayer: "X",
        winner: null
      },
      messageInput: "",
      messages: []
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
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
    this.initSocket = initSocket.bind(this);
  }
  componentDidMount() {
    this.initSocket();
  }
  handlePlayerNameChange(e) {
    this.setState({
      playerName: e.target.value.replace(/\s{2,}/g, " ").replace(/^\s+/g, "")
    });
  }
  handleIsChangeName() {
    this.setState({ isChangingName: true, playerName: "" });
  }
  handleIsChangeNameFalse() {
    this.setState(({ playerData }) => ({
      isChangingName: false,
      playerName: playerData.name
    }));
  }
  handleRoomNameChange(e) {
    this.setState({
      roomName: e.target.value.replace(/\s{2,}/g, " ").replace(/^\s+/g, "")
    });
  }
  handlePlayerNameSubmit(e) {
    e.preventDefault();
    const { playerName, playerData, connectionStatus } = this.state;
    const playerNameTrimmed = playerName
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/g, "");
    if (connectionStatus === "connected") {
      if (playerNameTrimmed !== playerData.name && playerNameTrimmed) {
        this.props.socket.emit("set-name", playerNameTrimmed, () => {
          this.setState({
            isChangingName: false,
            playerName: playerNameTrimmed
          });
        });
      } else if (playerData.name && playerNameTrimmed === playerData.name) {
        this.setState({ isChangingName: false });
      }
    } else {
      this.setState(prevState => {
        const { playerData } = prevState;
        return {
          isChangingName: false,
          playerName: playerNameTrimmed,
          playerData: { ...playerData, name: playerNameTrimmed }
        };
      });
    }
    sessionStorage.setItem("playerName", playerNameTrimmed);
  }
  handleRoomNameSubmit(e) {
    e.preventDefault();
    const { roomName, playerData } = this.state;
    const roomNameTrimmed = roomName
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/g, "");
    if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== "") {
      this.props.socket.emit("join-room", roomNameTrimmed, () => {
        this.setState({ messages: [] });
      });
    }
  }
  handleJoinRoomClick(e, name) {
    e.preventDefault();
    const { playerData } = this.state;
    const roomNameTrimmed = name
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/g, "");
    if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== "") {
      this.props.socket.emit("join-room", roomNameTrimmed, () => {
        this.setState({ messages: [] });
      });
    }
  }
  handleSquareClick(i) {
    if (this.state.playerData.roomName) {
      //in the case you are in a room send to server
      this.props.socket.emit("new-square", i);
    } else if (
      //else it's a local room and manage the game logic locally but check if can click
      this.state.playerData.team === this.state.roomData.currentPlayer &&
      !this.state.roomData.winner &&
      this.state.roomData.squares[i] === null
    ) {
      this.setState(
        prevState => {
          const {
            playerData: prevPlayerData,
            roomData: prevRoomData
          } = prevState;
          const {
            squares: prevSquares,
            currentPlayer: prevCurrentPlayer
          } = prevRoomData;
          const team = prevPlayerData.team;
          let newSquares = [...prevSquares];
          newSquares[i] = team;
          const winner = calculateWinner(newSquares, prevCurrentPlayer);
          const nextPlayer = winner
            ? prevCurrentPlayer
            : prevCurrentPlayer === "X"
              ? "O"
              : "X";
          const roomData = {
            ...prevRoomData,
            squares: newSquares,
            currentPlayer: nextPlayer,
            winner: winner
          };
          const playerData = { ...prevPlayerData, team: nextPlayer };
          return { roomData: roomData, playerData: playerData };
        },
        () => this.props.socket.emit("set-team", this.state.playerData.team)
      );
    }
  }
  handleTeamToggleClick(team) {
    if (this.state.playerData.team !== team) {
      this.setState(prevState => ({
        playerData: { ...prevState.playerData, team: team }
      }));
      this.props.socket.emit("set-team", team);
    }
  }
  handleResetClick() {
    if (this.state.playerData.roomName) {
      this.props.socket.emit("reset-game");
    } else if (this.state.roomData.squares.some(square => square !== null)) {
      this.setState(prevState => {
        const {
          roomData: prevRoomData,
          playerData: prevPlayerData
        } = prevState;
        const roomData = {
          ...prevRoomData,
          squares: Array(9).fill(null),
          currentPlayer: "X",
          winner: "",
          players: []
        };
        const playerData = {
          ...prevPlayerData,
          team: "X"
        };
        return { roomData, playerData };
      });
    }
  }
  handleLeaveRoomClick() {
    if (this.state.playerData.roomName) {
      this.props.socket.emit("leave-room");
      this.setState(prevState => {
        const {
          roomData: prevRoomData,
          playerData: prevPlayerData
        } = prevState;
        const roomData = {
          ...prevRoomData,
          squares: Array(9).fill(null),
          currentPlayer: "X",
          winner: "",
          players: []
        };
        const playerData = {
          ...prevPlayerData,
          team: "X"
        };
        return { roomData, playerData, messages: [] };
      });
    }
  }
  handleMessageChange(e) {
    this.setState({ messageInput: e.target.value });
  }
  handleMessageSubmit(e) {
    e.preventDefault();
    const { messageInput, playerData } = this.state;
    const { socket } = this.props;
    if (messageInput.trim() && playerData.roomName) {
      //console.log(messageInput);
      socket.emit("new-message", messageInput);
      this.setState({ messageInput: "" });
    } else if (messageInput.trim()) {
      this.setState(prevState => ({
        messageInput: "",
        messages: [
          ...prevState.messages,
          {
            message: prevState.messageInput,
            senderName: prevState.playerData.name || "Unnamed Player",
            messageID: uuid(),
            senderID: socket.id
          }
        ]
      }));
    }
  }
  render() {
    const squares = this.state.roomData.squares;
    const winner = calculateWinner(squares, this.state.roomData.currentPlayer);
    const isTurn =
      !winner &&
      this.state.playerData.team === this.state.roomData.currentPlayer;
    const playerNameConfirmed = this.state.playerData.name;
    const roomNameConfirmed = this.state.playerData.roomName;
    const {
      roomData,
      isChangingName,
      roomName,
      rooms,
      connectionStatus,
      showConnectionStatus,
      messageInput,
      messages
    } = this.state;
    const { players } = roomData;
    const NameAndRoomInputContainer = (
      <div className="name-room-container">
        <NameInput
          playerNameConfirmed={playerNameConfirmed}
          isChangingName={isChangingName}
          handlePlayerNameChange={this.handlePlayerNameChange}
          handlePlayerNameSubmit={this.handlePlayerNameSubmit}
          handleIsChangeName={this.handleIsChangeName}
          handleIsChangeNameFalse={this.handleIsChangeNameFalse}
          playerName={this.state.playerName}
        />
        <RoomInput
          roomNameConfirmed={roomNameConfirmed}
          handleRoomNameChange={this.handleRoomNameChange}
          handleRoomNameSubmit={this.handleRoomNameSubmit}
          handleJoinRoomClick={this.handleJoinRoomClick}
          roomName={roomName}
          rooms={rooms}
        />
      </div>
    );
    return (
      <div>
        <div className="game-container">
          <BoardContainer
            roomName={roomNameConfirmed}
            squares={squares}
            handleSquareClick={this.handleSquareClick}
            winner={winner}
            currentPlayer={this.state.roomData.currentPlayer}
          />
          <GameInfo
            handleTeamToggleClick={this.handleTeamToggleClick}
            handleResetClick={this.handleResetClick}
            handleLeaveRoomClick={this.handleLeaveRoomClick}
            playerData={this.state.playerData}
            winner={winner}
            isTurn={isTurn}
            players={players}
            connectionStatus={connectionStatus}
          />
          <ChatRoom
            messageInput={messageInput}
            messages={messages}
            handleMessageChange={this.handleMessageChange}
            handleMessageSubmit={this.handleMessageSubmit}
          />
        </div>
        {NameAndRoomInputContainer}
        <ConnectionStatus
          connectionStatus={connectionStatus}
          showConnectionStatus={showConnectionStatus}
        />
      </div>
    );
  }
}

export const TicTacToeWithSocket = withSocket(TicTacToeContainer);
