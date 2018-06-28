const io = require('socket.io')();
const port = 8000;

io.listen(port);
console.log('listening on port ', port);

let rooms = [];
let allPlayers = [];

class Room {
    constructor(name, player) {
        this.name = name;
        this.players = [player];
        this.squares = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.turnNumber = 0;
        this.pushData();
    }
    receivedSquare(newSquare) {
        //Handle receiving new squares from a player.
        if (this.squares[newSquare] === null) {
            this.setSquares(newSquare);
            this.pushData();
        }
    }
    setSquares(newSquare) {
        this.squares[newSquare] = this.currentPlayer;
        this.turnNumber++;
        let result = this.calculateWinner(this.squares);
        if (result === 'X' || result === 'O' || result === 'draw') {
            //There's a WINNER or a DRAW
            this.currentPlayer = null;
            this.winner = result;
        } else {
            //Game continues
            this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
        }
    }
    get playerData() {
        let playerData = this.players.map((player) => {
                return(
                    {name: player.name, team: player.team}
                );
            }
        );
        return playerData;
    }
    get data() {
        //getter allows me to access thisRoom.data to get data object    
        let data = {
            squares: this.squares,
            players: this.playerData,
            currentPlayer: this.currentPlayer,
            winner: this.winner,
        };
        return data;
    }
    pushData() {
        //TODO
        //pushes this room's data to EVERY connected player in room
        io.to(this.name).emit('game-data', this.data);
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
            [2, 4, 6],
        ];
        let winningLines = [];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                winningLines.push(lines[i]);
                //console.log(winningLines);
            }
        }
        return winningLines;
    }
    calculateWinner(squares) {
        //TODO
        let winningLines = this.calculateWinningLines(squares);
        //console.log(winningLines);
        let result;
        if (winningLines.length === 0) {
            // no winner it was either a draw or game continues
            if (this.turnNumber === 9) {
                return result = 'draw';
            } else {
                return result = null;
            }
        } else {
            return this.currentPlayer;
        }
        //Return X, O, draw, or null
    }
    playerJoined(player) {
        //TODO
        //add the new player to the this.players
        this.players.push(player);
        this.pushData();
    }
    playerLeft(player) {
        //TODO
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
    reset() {
        //TODO
        //reset game state
        this.squares = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.turnNumber = 0;
    }

}
class Player {
    constructor(socket) {
        this.client = socket;
        this.name = null;
        this.room = {};
        this.team = null;
    };
    get data () {
        let data = {
            name: this.name,
            roomName: this.room.name,
            team: this.team,
        };
        return data;
    }
    joinRoom(roomName) {
        if (roomName !== '' && this.room.name !== roomName) {
            //if (this.room !== null) {
            if(!(Object.keys(this.room).length === 0 && this.room.constructor === Object)){
                this.leaveRoom();
                this.room = {};
            }
            let room = rooms.find(room => room.name === roomName);
            if (!room) {
                this.client.join(roomName);
                room = new Room(roomName, this);
                rooms.push(room);
                this.room = room;
                emitRooms();
                //this.client.join(this.room.name);
            } else {
                this.room = room;
                this.client.join(this.room.name);
                this.room.playerJoined(this);
            }

        }
    }
    leaveRoom() {
        if (!(Object.keys(this.room).length === 0 && this.room.constructor === Object)) {
            this.client.leave(this.room.name);
            this.room.playerLeft(this);
            this.room = {};
        }
    }
    resetRoom() {
        this.room.reset();
    }
    setName(name) {
        if(name){
            this.name = name;
        }
    }
    setTeam(team) {
        this.team = team;
        //should set this.team to either 'X' or 'O' or null
    }
    pushedSquare(newSquare) {
        if (this.room !== null) {
            if (this.team === this.room.currentPlayer) {
                this.room.receivedSquare(newSquare);
            }
        }
    }
}

function emitRooms() {
    io.emit('rooms', rooms.map(room => room.name));
}   

function clientConnect(client, player) {
    console.log("New client connected");
    allPlayers.push(player);
    client.emit('hello', rooms.map(room => room.name));
    //console.log(allPlayers.map(player => player.name));
}

function clientDisconnect(client, player) {
    console.log("Client disconnected");
    const i = allPlayers.findIndex(p => p.client === client);
    if (i !== -1) {
        allPlayers.splice(i, 1);
    }
    player.leaveRoom();
    //console.log(allPlayers.map(player => player.name));
}

io.on('connection', client => {
    let player = new Player(client);
    clientConnect(client, player);
    client.on('set-name', (name) => {
        player.setName(name)
    });
    client.on('join-room', (roomName) => {
        player.joinRoom(roomName);
    });
    client.on('set-team', (team) => {
        player.setTeam(team)
    });
    client.on('new-square', (newSquare) => {
        player.pushedSquare(newSquare);
    });
    client.on('reset-game', () => {
        player.resetRoom()
    });
    client.on('leave-room', () => {
        player.leaveRoom()
    });

    client.on("disconnect", () => {
        clientDisconnect(client, player);
    });
});

setInterval(() => {
    console.log(allPlayers.map(player => player.name));
    console.log(rooms);
}, 5000);