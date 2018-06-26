const io = require('socket.io')();
const port = 8000;

io.listen(port);
console.log('listening on port ', port);

let rooms = [];
let allPlayers = [];

class Room {
    constructor(name, player) 
    {
       this.name = name;
       this.players = [player];
       this.squares = Array(9).fill(null);
       this.currentPlayer = 'X';
       this.winner = null;
       this.turnNumber = 0;
    }
    receivedSquare(newSquare) {
        //Handle receiving new squares from a player.
        if(this.squares[newSquare] === null){
            this.setSquares(newSquare);
            this.pushData();
        }
    }
    setSquares(newSquare) {
        this.squares[newSquare] = this.currentPlayer;
        this.turnNumber++;
        let result = this.calculateWinner(this.squares);
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
            players: this.players.map(player => player.name),
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
    calculateWinningLines(squares){
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
    calculateWinner(squares){
        //TODO
        let winningLines = this.calculateWinningLines(squares);
        console.log(winningLines);
        let result;
        if(winningLines.length === 0){
            // no winner it was either a draw or game continues
            if(this.turnNumber === 9){
                return result = 'draw';
            }
            else{
                return result = null;
            }
        }
        else{
            return this.currentPlayer;
        }
        //Return X, O, draw, or null
    }
    playerJoined(player){
        //TODO
        //add the new player to the this.players
        this.players.push(player);
        io.to(this.name).emit('game-data', this.data);
    }
    playerLeft(player){
        //TODO
        //remove the player from this.players
        const i = this.players.indexOf(player);
        if (i !== -1) {
            this.players.splice(i, 1);
        }
    }
    reset(){
        //TODO
        //reset game state
        this.squares = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.turnNumber = 0;
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
            this.room.playerJoined(this);
        }
        this.client.join(this.room.name);
    }
    leaveRoom(){
        this.room.playerLeft(this);
        this.client.leave(this.room.name);
        this.room = null;
    }
    resetRoom(){
        this.room.reset();
    }
    setName(name){
        this.name = name;
    }
    setTeam(team){
        this.team = team;
        //should set this.team to either 'X' or 'O' or null
    }
    pushedSquare(newSquare){
        if(this.team === this.room.currentPlayer){
            this.room.receivedSquare(newSquare);
        }
    }
}
function clientConnect(client, player) {
    console.log("New client connected");   
    allPlayers.push(player);
    client.emit('hello');
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
    //client sets name
    client.on('set-name', (name) => {player.setName(name);});
    //client joins room
    client.on('join-room', (roomName) => {player.joinRoom(roomName);});
    //client picks team
    client.on('set-team', (team) => {player.setTeam(team);});
    //client sends squares
    client.on('new-square', (newSquare) => {player.pushedSquare(newSquare);});
    //client resets game
    client.on('reset-game', () => {player.resetRoom();});
    //client leaves room
    client.on('leave-room', () => {player.leaveRoom();});

    client.on("disconnect", ()=> {    
        clientDisconnect(client, player);
    });
});

setInterval(()=>{
    console.log(allPlayers.map(player => player.team));
    console.log(rooms);
}, 5000);
