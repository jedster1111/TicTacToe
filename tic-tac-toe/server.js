const io = require('socket.io')();
const port = 8000;

io.listen(port);
console.log('listening on port ', port);

let rooms = [];
let players = [];

class Room {
    constructor(name, player) 
    {
       this.name = name;
       this.players = [player];
       this.squares = Array(9).fill(null);
       this.currentPlayer = 'X';
       this.winner = null;
    }
    receivedSquares(newSquares) {
        //TODO
        //Handle receiving new squares from a player.
        //Call thisRoom.squares = newSquares to handle
        //all game logic based on squares.
        //Push data to players in this room
    }
    set squares(newSquares) {
        let result = this.calculateWinner(newSquares);
        if (result === 'X' || result === 'O' || result === 'draw'){
            //There's a WINNER or a DRAW
            this.currentPlayer = null;
            this.winner = result;
        }
        else {
            //Game continues
            this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
        }
    }
    
    get data() {
        //getter allows me to access thisRoom.data to get data object
        let data = 
        {
            squares: this.squares,
            players: this.players,
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
    calculateWinner(squares){
        //TODO
        //Return X, O, draw, or null
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
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
              //return lines[i];
              winningLines.push(lines[i]);
              //console.log(winningLines);
            }
        }
    }
    playerJoined(player){
        //TODO
        //add the new player to the this.players
    }
    playerLeft(player){
        //TODO
        //remove the player from this.players
    }
    reset(){
        //TODO
        //reset game state
    }

}

class Player {
    constructor(socket){
        this.client = socket;
        this.name = null;
        this.room = null;
        this.team = null;
    };
    joinRoom(roomName){
        if(this.room !== null){
            this.leaveRoom();
            this.room = null;
        }
        let room = rooms.find(room => room.name === roomName);
        if(!room){
            room = new Room(roomName,this);
            rooms.push(room);
            this.room = room;
        }
        else {
            this.room = room;
        }
        this.room.playerJoined(this);
        client.join(this.room.name);
    }
    leaveRoom(){
        this.room.playerLeft(this);
        client.leave(this.room.name);
        this.room = null;
    }
    pickTeam(team){
        this.team = team;
        //should set this.team to either 'X' or 'O'
    }
    pushedSquares(newSquares){
        if(this.team === this.room.currentPlayer){
            this.room.receivedSquares(newSquares);
        }
    }
}

io.on('connection', client => {
    console.log("New client connected");
    players.push(new Player(client));
    client.emit("hello");
    client.on("disconnect", ()=> {
        console.log("Client disconnected");
        const i = players.findIndex(p => p.client === client);
        players.splice(i, 1);
    });
});

