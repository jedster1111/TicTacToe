import React, { Component, Fragment } from "react";
import { RoomInput, NameInput, GameInfo } from "./GameInfo";
import { ConnectionStatus } from "./ConnectionStatus";
import { BoardContainer } from "./Board";
import { calculateWinner } from "./calculateWinner";
import { ChatRoom } from "./ChatRoom";
import "./App.css";
import io from "socket.io-client";
const ENVIRONMENT = process.env.NODE_ENV || "development";
//console.log(ENVIRONMENT);
ENVIRONMENT === "development" && console.log("You are running in DEV mode");

class GameContainer extends Component {
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
      messages: [],
      socket: null
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
  }
  componentDidMount() {
    this.initSocket();
  }
  initSocket = () => {
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
    socket.on("connect", () => {
      //console.log("connect fired off", this.state.playerData);
      this.state.playerData.name &&
        this.state.socket.emit("set-name", this.state.playerData.name, () => {
          this.setState(prevState => {
            return {
              isChangingName: false,
              playerName: prevState.playerData.name
            };
          });
        });
      this.state.socket.emit("set-team", this.state.playerData.team);
    });
    socket.on("hello", rooms => {
      console.log("Succesfully communicating with server!");
      this.setState(
        {
          rooms,
          connectionStatus: "connected",
          showConnectionStatus: true
        },
        () => {
          //show connection status for some time then hide again
          setTimeout(() => {
            this.setState({ showConnectionStatus: false });
          }, 5000);
        }
      );
    });
    socket.on("game-data", roomData => {
      //console.log(roomData);
      this.setState({ roomData });
    });
    socket.on("player-data", playerData => {
      //console.log(playerData);
      this.setState({ playerData });
    });
    socket.on("rooms", rooms => {
      this.setState(() => ({ rooms }));
    });
    socket.on("disconnect", () => {
      console.log("Trying to reconnect");
      this.setState(prevState => {
        const isNotInRoom = prevState.playerData.roomName === "";
        const playerData = isNotInRoom
          ? prevState.playerData
          : { ...prevState.playerData, roomName: "", team: "X" };
        const roomData = isNotInRoom
          ? prevState.roomData
          : {
              squares: Array(9).fill(null),
              players: [],
              currentPlayer: "X",
              winner: null
            };
        return {
          playerName: "",
          roomName: "",
          rooms: [],
          playerData: playerData,
          roomData: roomData,
          connectionStatus: "connecting",
          showConnectionStatus: true
        };
      });
    });
    socket.on("reconnecting", attemptNumber => {
      if (attemptNumber < 5) {
        console.log(`Disconnected, attempt to reconnect #${attemptNumber}`);
      } else if (attemptNumber === 5) {
        console.log("Have you lost connection? Try refreshing?");
        this.setState(
          {
            connectionStatus: "disconnected"
          },
          () => {
            setTimeout(() => {
              this.setState({ showConnectionStatus: false });
            }, 5000);
          }
        );
      }
    });
    socket.on("new-message", (message, senderName) => {
      this.setState(prevState => {
        const prevMessages = prevState.messages;
        const messages = [
          ...prevMessages,
          { message: message, sender: senderName }
        ];
        console.log(messages);
        return { messages: messages };
      });
    });
    this.setState({ socket });
  };
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
  playerNameSubmit() {
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
  handlePlayerNameSubmit(e) {
    e.preventDefault();
    this.playerNameSubmit();
  }
  handleRoomNameSubmit(e) {
    e.preventDefault();
    const { roomName, playerData } = this.state;
    const roomNameTrimmed = roomName
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/g, "");
    if (roomNameTrimmed !== playerData.roomName && roomNameTrimmed !== "") {
      this.state.socket.emit("join-room", roomNameTrimmed, () => {
        //this.setState({roomName: ''});
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
      this.state.socket.emit("join-room", roomNameTrimmed, () => {
        //this.setState({roomName: ''});
      });
    }
  }
  handleSquareClick(i) {
    if (this.state.playerData.roomName) {
      //in the case you are in a room send to server
      this.state.socket.emit("new-square", i);
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
        () => this.state.socket.emit("set-team", this.state.playerData.team)
      );
    }
  }
  handleTeamToggleClick(team) {
    if (this.state.playerData.team !== team) {
      this.setState(prevState => ({
        playerData: { ...prevState.playerData, team: team }
      }));
      this.state.socket.emit("set-team", team);
    }
  }
  handleResetClick() {
    if (this.state.playerData.roomName) {
      this.state.socket.emit("reset-game");
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
      this.state.socket.emit("leave-room");
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
  handleMessageChange(e) {
    this.setState({ messageInput: e.target.value });
  }
  handleMessageSubmit(e) {
    e.preventDefault();
    const { messageInput, socket, playerData } = this.state;
    if (messageInput && playerData.roomName) {
      //console.log(messageInput);
      socket.emit("new-message", messageInput);
      this.setState({ messageInput: "" });
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
    return (
      <Fragment>
        <ChatRoom
          messageInput={messageInput}
          messages={messages}
          handleMessageChange={this.handleMessageChange}
          handleMessageSubmit={this.handleMessageSubmit}
        />
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
        </div>
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
        <ConnectionStatus
          connectionStatus={connectionStatus}
          showConnectionStatus={showConnectionStatus}
        />
      </Fragment>
    );
  }
}

class App extends Component {
  render() {
    return <GameContainer />;
  }
}

export default App;
