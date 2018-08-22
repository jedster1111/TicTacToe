import React, { Component, Fragment } from "react";
import "./App.css";
import { TicTacToeContainer } from "./TicTacToe/TicTacToeContainer";
import { withSocket } from "./withSocketHOC";

const TicTacToeWithSocket = withSocket(TicTacToeContainer);
class App extends Component {
  render() {
    return (
      <Fragment>
        <TicTacToeWithSocket />
      </Fragment>
    );
  }
}

export default App;
