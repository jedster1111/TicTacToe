import React from "react";
import { calculateWinningLines } from "./calculateWinner";
import "./Board.css";

function flattenAndClean(winningLines) {
  return [...new Set([].concat(...winningLines))];
}
const Square = props => {
  return (
    <button className={`square ${props.extraClass}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
};
export const Board = props => {
  const { squares } = props;
  const winningLines = calculateWinningLines(squares);
  const winningSquares = flattenAndClean(winningLines); //flattens and removes duplicates
  //winningSquares && console.log(winningLines, winningSquares);
  const renderSquare = i => {
    const square = squares[i];
    const extraClass = winningSquares.indexOf(i) !== -1 ? "winning-square" : "";
    return (
      <Square
        value={square}
        key={i}
        onClick={() => props.onClick(i)}
        extraClass={extraClass}
      />
    );
  };
  const createTable = () => {
    let rows = [];
    for (let i = 0; i < 3; i++) {
      let columns = [];
      for (let j = 0; j < 3; j++) {
        columns.push(renderSquare(j + i * 3));
      }
      rows.push(
        <div className="board-row" key={i}>
          {columns}
        </div>
      );
    }
    return rows;
  };
  return <div className="board">{createTable()}</div>;
};
const BoardRoomText = ({ roomName }) => {
  const text = roomName ? (
    <div className="board-room-text">{roomName}</div>
  ) : (
    <div className="board-room-text">Offline Game</div>
  );
  return text;
};
const BoardTurnText = ({ winner, currentPlayer }) => {
  const text =
    winner === null
      ? `${currentPlayer}'s turn`
      : winner === "draw"
        ? `Draw!`
        : `${currentPlayer} wins!`;
  const extraClass = winner === null ? "" : " finished";
  return <div className={`board-turn-text-container${extraClass}`}>{text}</div>;
};
export const BoardContainer = props => {
  const { roomName, squares, handleSquareClick, currentPlayer, winner } = props;
  return (
    <div className="board-container">
      <BoardRoomText roomName={roomName} />
      <Board squares={squares} onClick={handleSquareClick} />
      <BoardTurnText winner={winner} currentPlayer={currentPlayer} />
    </div>
  );
};
