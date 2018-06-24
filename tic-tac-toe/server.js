const io = require('socket.io')();
const port = 8000;

io.listen(port);
console.log('listening on port ', port);

let rooms = [];

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
        let result = this.calculateWinner();
        if (result === 'X' || result === 'O' || result === 'draw'){
            //There's a WINNER or a DRAW
            this.currentPlayer = null;
            this.winner = result;
        }
        else {
            //Game continues
            this.currentPlayer = (this.currentPlayer = 'X') ? 'O' : 'X';
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
    }
    calculateWinner(){
        //TODO
        //Return X, O, draw, or null
    }
    playerJoined(player){
        //TODO
        //add the new player to the this.players
    }
    playerLeft(player){
        //TODO
        //remove the player from this.players
    }

}

class Player {
    constructor(socket){
        client = socket;
        name = null;
        room = null;
        team = null;
    };
    joinRoom(roomName){
        if(this.room !== null){
            client.leave(this.room.name);
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
        client.join(this.room.name);
    }
    leaveRoom(){
        client.leave(this.room.name);
        this.room = null;
    }
}

io.on('connection', client => {
    console.log("New client connected");
    client.emit("hello");
    client.on("disconnect", ()=> console.log("Client disconnected"));
});

console.log(new Room('jed','test'));
