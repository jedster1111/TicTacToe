import React, { Component, Fragment } from "react";
import "./App.css";
import { TicTacToeContainer } from "./TicTacToe/TicTacToeContainer";
import io from "socket.io-client";
import { ENVIRONMENT } from "./TicTacToe/environmentCheck";
import { NameAndRoomInputContainer } from "./NameAndRoomInput/NameAndRoomInputContainer";
import { initSocket } from "./initSocket";

class App extends Component {
  constructor(props) {
    super(props);
    const playerName = sessionStorage.getItem("playerName") || "";
    let socket;
    if (ENVIRONMENT === "development") {
      let LOCALIP = process.env.REACT_APP_LOCAL_IP || "localhost";
      if (LOCALIP === "localhost") {
        console.log(
          `You are running on ${LOCALIP}, see readme to set environment variable for local ip if you want to test on multiple devices!`
        );
      } else {
        console.log(`You are running on ${LOCALIP}`);
      }
      socket = io(`http://${LOCALIP}:8000`);
    } else {
      socket = io();
    }
    this.state = {
      connectionStatus: "connecting",
      showConnectionStatus: true,
      isChangingName: playerName === "",
      playerName: playerName,
      roomName: "",
      rooms: [],
      playerData: { name: playerName, roomName: "", id: "" },
      joinedRoom: "",
      socket: socket
    };
    this.initSocket = initSocket.bind(this);
    this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
    this.handlePlayerNameSubmit = this.handlePlayerNameSubmit.bind(this);
    this.handleIsChangeName = this.handleIsChangeName.bind(this);
    this.handleIsChangeNameFalse = this.handleIsChangeNameFalse.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.handleRoomNameSubmit = this.handleRoomNameSubmit.bind(this);
    this.handleJoinRoomClick = this.handleJoinRoomClick.bind(this);
    this.handleLeaveRoomClick = this.handleLeaveRoomClick.bind(this);
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
        this.state.socket.emit("set-name", playerNameTrimmed, () => {
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
  handleRoomNameSubmit(e, name) {
    e.preventDefault();
    const { socket } = this.state;
    function emitName(name) {
      // console.log(name);
      socket.emit("join-room", name);
    }
    if (name) {
      this.setState({ joinedRoom: name }, () => emitName(name));
    } else {
      this.setState(
        prevState => ({ joinedRoom: prevState.roomName }),
        () => emitName(this.state.joinedRoom)
      );
    }
    // const { roomName, playerData } = this.state;
    // const roomNameTrimmed = roomName
    //   .trim()
    //   .replace(/\s{2,}/g, " ")
    //   .replace(/^\s+/g, "");
    // if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== "") {
    //   this.state.socket.emit("join-room", roomNameTrimmed, () => {
    //     this.setState({ messages: [] });
    //   });
    // }
  }
  handleJoinRoomClick(e, name) {
    e.preventDefault();
    // const { playerData } = this.state;
    // const roomNameTrimmed = name
    //   .trim()
    //   .replace(/\s{2,}/g, " ")
    //   .replace(/^\s+/g, "");
    // if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== "") {
    //   this.state.socket.emit("join-room", roomNameTrimmed, () => {
    //     this.setState({ messages: [] });
    //   });
    // }
  }
  handleLeaveRoomClick() {
    if (this.state.joinedRoom) {
      this.state.socket.emit("leave-room", () => {
        this.setState({ joinedRoom: "" });
      });
    }
  }
  render() {
    const {
      name: playerNameConfirmed,
      roomName: roomNameConfirmed
    } = this.state.playerData;
    const {
      socket,
      isChangingName,
      playerName,
      roomName,
      rooms,
      joinedRoom,
      playerData
    } = this.state;
    return (
      <Fragment>
        <TicTacToeContainer
          socket={socket}
          joinedRoom={joinedRoom}
          handleLeaveRoomClick={this.handleLeaveRoomClick}
          playerData={playerData}
        />
        <NameAndRoomInputContainer
          playerNameConfirmed={playerNameConfirmed}
          isChangingName={isChangingName}
          handlePlayerNameChange={this.handlePlayerNameChange}
          handlePlayerNameSubmit={this.handlePlayerNameSubmit}
          handleIsChangeName={this.handleIsChangeName}
          handleIsChangeNameFalse={this.handleIsChangeNameFalse}
          playerName={playerName}
          roomNameConfirmed={roomNameConfirmed}
          handleRoomNameChange={this.handleRoomNameChange}
          handleRoomNameSubmit={this.handleRoomNameSubmit}
          handleJoinRoomClick={this.handleRoomNameSubmit}
          roomName={roomName}
          rooms={rooms}
        />
      </Fragment>
    );
  }
}

export default App;
