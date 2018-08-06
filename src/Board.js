import React from 'react';
import './Board.css';

const Square = (props) => {
	return(
    <button className = "square" onClick={props.onClick}>
      {props.value}
    </button>
	);
}
export const Board = (props) => {
  const renderSquare = (i) => {
    return(
      <Square 
        value = {props.squares[i]}
        key = {i}
        onClick = {() => props.onClick(i)}
      />
    );
  }
  const createTable = () => {
    let rows = [];
    for(let i=0; i<3; i++){
      let columns = [];
      for(let j=0; j<3; j++){
        columns.push(renderSquare(j+(i*3)));
      }
      rows.push(
        <div className="board-row" key={i}>
          {columns}
        </div>
      );
    }
    return rows;
  }
  return (
    <div className='board'>
      {createTable()}
    </div>
  );
}
export const BoardContainer = (props) => {
  const {roomName, squares, handleSquareClick} = props;
  return(
    <div className='board-container'>
      {roomName ? 
        <div className='board-room-text'>{roomName}</div>
        :
        <div className='board-room-text'>Offline Game</div> 
      }
      <Board squares={squares} onClick={handleSquareClick} />
    </div>
  )
}