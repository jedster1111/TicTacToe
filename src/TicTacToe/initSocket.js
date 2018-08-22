export function initSocket() {
  const socket = this.props.socket;
  socket.on("connect", () => {
    //console.log("connect fired off", this.state.playerData);
    this.state.playerData.name &&
      socket.emit("set-name", this.state.playerData.name, () => {
        this.setState(prevState => {
          return {
            isChangingName: false,
            playerName: prevState.playerData.name
          };
        });
      });
    socket.emit("set-team", this.state.playerData.team);
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
      const messages = isNotInRoom ? prevState.messages : [];
      return {
        playerName: "",
        roomName: "",
        rooms: [],
        playerData: playerData,
        roomData: roomData,
        connectionStatus: "connecting",
        showConnectionStatus: true,
        messages: messages
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
