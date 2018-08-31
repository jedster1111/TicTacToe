import React, { Component, Fragment } from "react";
import { BoardContainer } from "./Board";
import { GameInfo } from "./GameInfo";

class TicTacToeGame extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { squares, winner, currentPlayer, players } = this.props.gameData;
    const { socket } = this.props;
    //find player with same id as client and check if it's team === current team
    const isTurn =
      !winner &&
      currentPlayer ===
        players[players.findIndex(player => player.id === socket.id)].team;
    return (
      <Fragment>
        <BoardContainer
          squares={squares}
          handleSquareClick={this.props.handleSquareClick}
          winner={winner}
          currentPlayer={currentPlayer}
        />
        <GameInfo
          handleTeamToggleClick={this.handleTeamToggleClick}
          handleResetClick={this.handleResetClick}
          playerData={this.props.playerData}
          winner={winner}
          isTurn={isTurn}
          players={players}
        />
      </Fragment>
    );
  }
}
