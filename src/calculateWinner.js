export const calculateWinningLines=(squares)=>{
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
      }
  }
  return winningLines;
}
export const calculateWinner=(squares, currentPlayer)=>{
	const winningLines = calculateWinningLines(squares);
	const turnNumber = calculateTurnNumber(squares);
	//console.log(turnNumber);
  let result;
  if (winningLines.length === 0) {
      // no winner it was either a draw or game continues
      if (turnNumber === 9) {
          result = 'draw';
      } else {
          result = null;
      }
  } else {
      result = currentPlayer;
  }
  return result;
  //Return X, O, draw, or null
}

export function calculateTurnNumber(squares) {
    return squares.reduce((count, square) => {
        if (square !== null) {
            return (count + 1);
        }
        else {
            return count;
        }
    }, 0);
}
