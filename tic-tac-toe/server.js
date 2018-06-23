const io = require('socket.io')();
const port = 8000;

io.listen(port);
console.log('listening on port ', port);

io.on('connection', socket => {
    console.log("New client connected");
    socket.emit("connection");
    socket.on("disconnect", ()=> console.log("Client disconnected"));
});