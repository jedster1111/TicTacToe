const path = require("path");
const express = require("express");
const uuid = require("uuid/v1");
const ENVIRONMENT = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 8000;
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

console.log(ENVIRONMENT, PORT);
ENVIRONMENT === "development" && console.log("You are running in dev mode");

//const socketPort = 8000;
if (ENVIRONMENT === "development") {
  app.use(express.static(path.join(__dirname, "../../build")));
  app.get("/", (req, res) =>
    res
      .send({
        response: "I am alive"
      })
      .status(200)
  );
} else {
  app.use(express.static(path.join(__dirname, "../../build")));
  app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../../build/index.html"))
  );
}

server.listen(PORT);
console.log("listening on port", PORT);

let rooms = [];
let allPlayers = [];

class TicTacToeGame {
  constructor(room) {
    this.room = room;
    this.id = uuid();
    this.squares = Array(9).fill(null);
    this.currentPlayer = "X";
    this.winner = null;
    this.turnNumber = 0;
    this.players = room.players.reduce((players, player) => {
      players[player.id] = {
        player: player,
        team: "spectator"
      };
      return players;
    }, {});
    console.log(this.players);
  }
  get teams() {
    let xTeam = [];
    let oTeam = [];
    let spectators = [];
    const players = this.players;
    // loop through player objects in each team and add to relevant team list
    for (const playerID in players) {
      console.log(players[playerID]);
      if (players[playerID].team === "X") {
        xTeam.push({
          id: players[playerID].player.id,
          name: players[playerID].player.name
        });
      } else if (players[playerID].team === "O") {
        oTeam.push({
          id: players[playerID].player.id,
          name: players[playerID].player.name
        });
      } else if (players[playerID].team === "spectator") {
        // console.log("should push to spectators");
        spectators.push({
          id: playerID,
          name: players[playerID].player.name
        });
      }
    }
    return { xTeam: xTeam, oTeam: oTeam, spectators: spectators };
  }
  get data() {
    let players = [];
    for (const playerID in this.players) {
      const thisPlayer = this.players[playerID];
      players.push({
        id: thisPlayer.player.id,
        name: thisPlayer.player.name,
        team: thisPlayer.team
      });
    }
    return {
      id: this.id,
      type: "TicTacToe",
      squares: this.squares,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      turnNumber: this.turnNumber,
      players: players,
      teams: this.teams
    };
  }
  setTeam(playerID, team) {
    this.players[playerID].team = team;
  }
  receivedSquare(newSquare) {
    //Handle receiving new squares from a player.
    if (this.squares[newSquare] === null) {
      this.setSquares(newSquare);
      this.room.pushData();
    }
  }
  setSquares(newSquare) {
    this.squares[newSquare] = this.currentPlayer;
    this.turnNumber++;
    let result = this.calculateWinner(this.squares);
    if (result === "X" || result === "O" || result === "draw") {
      //There's a WINNER or a DRAW
      this.winner = result;
    } else {
      //Game continues
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
  }
  calculateWinningLines(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    let winningLines = [];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        winningLines.push(lines[i]);
      }
    }
    return winningLines;
  }
  calculateWinner(squares) {
    let winningLines = this.calculateWinningLines(squares);
    let result;
    if (winningLines.length === 0) {
      // no winner it was either a draw or game continues
      if (this.turnNumber === 9) {
        result = "draw";
      } else {
        result = null;
      }
    } else {
      result = this.currentPlayer;
    }
    return result;
    //Return X, O, draw, or null
  }
  reset() {
    //reset game state
    this.squares = Array(9).fill(null);
    this.currentPlayer = "X";
    this.turnNumber = 0;
    this.winner = null;
    this.room.pushData();
  }
}
class Room {
  constructor(name, player) {
    this.name = name;
    this.players = [player];
    const firstGame = new TicTacToeGame(this);
    this.games = { [firstGame.id]: firstGame }; //object of Games
    this.wins = [
      {
        [player.id]: 0
      }
    ]; //wins of each player in that room

    this.pushData();
  }
  get playersInRoom() {
    let playersInRoom = this.players.map(player => {
      return {
        name: player.name,
        // team: player.team,
        id: player.client.id
      };
    });
    return playersInRoom;
  }
  get data() {
    let gamesData = [];
    for (const gameID in this.games) {
      gamesData.push(this.games[gameID].data);
    }
    const data = {
      name: this.name,
      players: this.playersInRoom,
      games: gamesData,
      wins: this.wins
    };
    return data;
  }
  pushData() {
    //pushes this room's data to EVERY connected player in room
    io.to(this.name).emit("game-data", this.data);
  }
  playerJoined(player) {
    //add the new player to the this.players
    this.players.push(player);
    this.pushData();
  }
  playerLeft(player) {
    //remove the player from this.players
    const i = this.players.indexOf(player);
    if (i !== -1) {
      this.players.splice(i, 1);
    }
    if (this.players.length === 0) {
      let i = rooms.indexOf(this);
      if (i !== -1) {
        rooms.splice(i, 1);
        emitRooms();
      }
    }
    this.pushData();
  }
  sendMessage(message, senderName, socketID) {
    io.to(this.name).emit(
      "new-message",
      message,
      senderName || "Unnamed Player",
      uuid(),
      socketID
    );
  }
}
class Player {
  constructor(socket) {
    this.client = socket;
    this.id = socket.id;
    this.name = "";
    this.room = {};
    this.wins = 0;
  }
  get data() {
    let roomName;
    if (this.room.name === undefined) {
      roomName = "";
    } else {
      roomName = this.room.name;
    }
    const data = {
      id: this.id,
      name: this.name,
      roomName: roomName,
      wins: this.wins
    };
    return data;
  }
  get isInRoom() {
    return !(
      Object.keys(this.room).length === 0 && this.room.constructor === Object
    );
  }
  emitData() {
    this.client.emit("player-data", this.data);
  }
  emitDataToPlayers() {
    if (this.isInRoom) {
      this.room.pushData();
    }
  }
  joinRoom(roomName, setState) {
    if (roomName !== "" && this.room.name !== roomName) {
      if (this.isInRoom) {
        this.client.leave(this.room.name);
        this.room.playerLeft(this);
        this.room = {};
      }
      let room = rooms.find(room => room.name === roomName);
      if (!room) {
        this.client.join(roomName);
        room = new Room(roomName, this);
        rooms.push(room);
        this.room = room;
        emitRooms();
      } else {
        this.room = room;
        this.client.join(this.room.name);
        this.room.playerJoined(this);
      }
      this.emitData();
      setState();
    }
  }
  leaveRoom() {
    if (this.isInRoom) {
      this.client.leave(this.room.name);
      this.room.playerLeft(this);
      this.room = {};
      this.emitData();
    }
  }
  resetGame(gameID) {
    if (this.isInRoom) {
      this.room.reset(gameID);
    }
  }
  setName(name, setState) {
    if (name && name !== this.name) {
      this.name = name;
      this.emitData();
      this.emitDataToPlayers();
      setState();
    }
  }
  setTeam(gameID, team) {
    if (this.isInRoom && gameID in this.room.games) {
      // this.team = team; TODO set team in game class instead!
      const game = this.room.games[gameID];
      if (team !== game.players[this.id].team) {
        game.setTeam(this.id, team);
      }
      this.emitData();
      this.emitDataToPlayers();
    }
    //should set this.team to either 'X' or 'O' or null
  }
  pushedSquare(gameID, newSquare) {
    if (this.isInRoom && gameID in this.room.games) {
      const game = this.room.games[gameID];
      //if (this.team === this.room.currentPlayer && !this.room.winner) {
      if (game.currentPlayer === game.players[this.id].team) {
        game.receivedSquare(newSquare);
      }
    }
  }
  sendMessage(message) {
    if (this.isInRoom) {
      this.room.sendMessage(message, this.name, this.data.id);
    }
  }
}

function emitRooms() {
  io.emit("rooms", rooms.map(room => room.name));
}

function clientConnect(client, player) {
  console.log("New client connected");
  allPlayers.push(player);
  client.emit("hello", rooms.map(room => room.name));
  player.emitData();
}

function clientDisconnect(client, player) {
  console.log("Client disconnected");
  const i = allPlayers.findIndex(p => p.client === client);
  if (i !== -1) {
    allPlayers.splice(i, 1);
  }
  player.leaveRoom();
}

io.on("connection", client => {
  let player = new Player(client);
  clientConnect(client, player);
  client.on("set-name", (name, setState) => {
    player.setName(name.trim().replace(/\s{2,}/g, " "), setState);
  });
  client.on("join-room", (roomName, setState) => {
    player.joinRoom(roomName.trim().replace(/\s{2,}/g, " "), setState);
  });
  client.on("set-team", (gameID, team) => {
    player.setTeam(gameID, team);
  });
  client.on("new-square", (gameID, newSquare) => {
    player.pushedSquare(gameID, newSquare);
  });
  client.on("reset-game", gameID => {
    player.resetGame(gameID);
  });
  client.on("leave-room", () => {
    player.leaveRoom();
  });
  client.on("new-message", message => {
    //console.log(message);
    player.sendMessage(message);
  });
  client.on("disconnect", () => {
    clientDisconnect(client, player);
  });
});

//ENVIRONMENT === 'development' && setInterval(() => {
//    console.log(allPlayers.map(player => player.name));
//    console.log(rooms);
//}, 5000);

process.on("SIGINT", function() {
  console.log("\nShutting down, some one hit ctrl c");
  console.log("Stopping Server...");
  process.exit();
});
