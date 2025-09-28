import React, { useState } from 'react';
import './GameBoard.css';

const GameBoard = () => {
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);

  const checkWin = (board, player) => {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (board[row][0] === player && board[row][1] === player && board[row][2] === player) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] === player && board[1][col] === player && board[2][col] === player) {
        return true;
      }
    }

    // Check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
      return true;
    }
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
      return true;
    }

    return false;
  };

  const handleCellClick = (row, col) => {
    if (gameState !== 'playing' || board[row][col] !== null) {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for win condition
    if (checkWin(newBoard, currentPlayer)) {
      setGameState('won');
      setWinner(currentPlayer);
      return;
    }

    // Check for draw
    if (newBoard.every(row => row.every(cell => cell !== null))) {
      setGameState('draw');
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const handleCellHover = (row, col) => {
    if (gameState !== 'playing' || board[row][col] !== null) {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for win condition
    if (checkWin(newBoard, currentPlayer)) {
      setGameState('won');
      setWinner(currentPlayer);
      return;
    }

    // Check for draw
    if (newBoard.every(row => row.every(cell => cell !== null))) {
      setGameState('draw');
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(3).fill(null).map(() => Array(3).fill(null)));
    setCurrentPlayer('X');
    setGameState('playing');
    setWinner(null);
  };

  const getStatusMessage = () => {
    if (gameState === 'won') {
      return `Player ${winner} wins!`;
    } else if (gameState === 'draw') {
      return "It's a draw!";
    } else {
      return `Current player: ${currentPlayer}`;
    }
  };

  return (
    <div className="game-board">
      <h2>Tic Tac Toe</h2>
      <div className="status">{getStatusMessage()}</div>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                disabled={gameState !== 'playing'}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
};

export default GameBoard;
