import React, { useState } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import './assets/css/global.css';

function App() {
  const [players] = useState([
    { name: '3. Oyuncu', score: 0 },
    { name: '2. Oyuncu', score: 0 },
    { name: '1. Oyuncu', score: 0 },
    { name: '4. Oyuncu', score: 0 }
  ]);

  const [currentPlayer] = useState(2); // 1. Oyuncu

  const [playerTiles] = useState([
    Array(14).fill({ value: '13', color: 'red' }),
    Array(14).fill({ value: '13', color: 'black' }),
    [
      { value: '13', color: 'red' },
      { value: '13', color: 'yellow' },
      { value: '13', color: 'blue' },
      { value: '13', color: 'black' },
      { value: '3', color: 'yellow' },
      { value: '3', color: 'blue' },
      { value: '3', color: 'black' },
      ...Array(7).fill({ value: '', color: 'black' })
    ],
    Array(14).fill({ value: '13', color: 'black' })
  ]);

  const handleTileClick = (playerIndex, tileIndex) => {
    console.log(`Player ${playerIndex} clicked tile ${tileIndex}`);
  };

  console.log('Rendering App with:', { players, currentPlayer, playerTiles });

  return (
    <div className="game-container">
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        playerTiles={playerTiles}
        onTileClick={handleTileClick}
      />
    </div>
  );
}

export default App;
