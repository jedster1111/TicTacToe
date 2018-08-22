import React, { Component } from "react";
import "./App.css";
import { GameContainerWithSocket } from "./GameContainer/GameContainer";

class App extends Component {
  render() {
    return <GameContainerWithSocket />;
  }
}

export default App;
