import React, { Component } from "react";
import { GameInfo } from "../GameInfo";
import { BoardContainer } from "../Board/Board";
import { calculateWinner } from "../calculateWinner";
import { ChatRoom } from "../ChatRoom";
const uuid = require("uuid/v1");

export class TicTacToeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: "X",
      roomData: {
        squares: Array(9).fill(null),
        players: [],
        currentPlayer: "X",
        winner: null
      },
      messageInput: "",
      messages: []
    };
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handleTeamToggleClick = this.handleTeamToggleClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleLeaveRoomClick = this.handleLeaveRoomClick.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
  }
  componentDidMount() {
    const { socket, joinedRoom } = this.props;
    socket.on("game-data", roomData => {
      this.setState({ roomData });
    });
    socket.on("new-message", (message, senderName, messageID, senderID) => {
      this.setState(prevState => {
        const prevMessages = prevState.messages;
        const messages = [
          ...prevMessages,
          {
            message: message,
            senderName: senderName,
            messageID: messageID,
            senderID: senderID
          }
        ];
        console.log(messages);
        return { messages: messages };
      });
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.joinedRoom !== this.props.joinedRoom) {
      const { socket } = this.props;
      socket.emit("join-room", this.props.joinedRoom);
      socket.emit("set-team", this.state.team);
    }
  }
  handleSquareClick(i) {
    if (
      this.state.team === this.state.roomData.currentPlayer &&
      !this.state.roomData.winner &&
      this.state.roomData.squares[i] === null
    ) {
      if (this.props.joinedRoom) {
        //in the case you are in a room send to server
        // console.log("thisishappening");
        this.props.socket.emit("new-square", i);
      } else {
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
            const team = prevState.team;
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
            return { roomData: roomData, team: nextPlayer };
          }
          //() => this.props.socket.emit("set-team", this.state.playerData.team)
        );
      }
    }
  }
  handleTeamToggleClick(team) {
    if (this.state.team !== team) {
      this.setState({ team: team });
      this.props.socket.emit("set-team", team);
    }
  }
  handleResetClick() {
    if (this.props.joinedRoom) {
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
        return { roomData, team: "X" };
      });
    }
  }
  handleLeaveRoomClick() {
    if (this.props.joinedRoom) {
      console.log("happpennignigngni");
      this.setState(prevState => {
        const { roomData: prevRoomData } = prevState;
        const roomData = {
          ...prevRoomData,
          squares: Array(9).fill(null),
          currentPlayer: "X",
          winner: "",
          players: []
        };
        return { roomData, messages: [], team: "X" };
      });
      this.props.handleLeaveRoomClick();
    }
  }
  handleMessageChange(e) {
    this.setState({ messageInput: e.target.value });
  }
  handleMessageSubmit(e) {
    e.preventDefault();
    const { messageInput, playerData } = this.state;
    const { socket, joinedRoom } = this.props;
    if (messageInput.trim() && joinedRoom) {
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
      !winner && this.state.team === this.state.roomData.currentPlayer;
    const roomNameConfirmed = this.props.joinedRoom;
    const {
      roomData,
      connectionStatus,
      messageInput,
      messages,
      team
    } = this.state;
    const { players } = roomData;
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
            playerData={this.props.playerData}
            team={team}
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
      </div>
    );
  }
}
