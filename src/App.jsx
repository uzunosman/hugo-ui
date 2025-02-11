import React, { useState } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import './assets/css/global.css';

// Rastgele taş oluşturma fonksiyonu
const generateRandomTile = () => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
  const colors = ['red', 'black', 'blue', 'yellow'];

  return {
    value: numbers[Math.floor(Math.random() * numbers.length)],
    color: colors[Math.floor(Math.random() * colors.length)]
  };
};

// 14 taşlık bir set oluşturma
const generateTileSet = () => {
  return Array(14).fill(null).map(() => generateRandomTile());
};

function App() {
  const [players] = useState([
    { name: '3. Oyuncu', score: 0 },
    { name: '2. Oyuncu', score: 0 },
    { name: '1. Oyuncu', score: 0 },
    { name: '4. Oyuncu', score: 0 }
  ]);

  const [currentPlayer] = useState(2); // 1. Oyuncu

  const [playerTiles] = useState([
    generateTileSet(), // 3. Oyuncu
    generateTileSet(), // 2. Oyuncu
    generateTileSet(), // 1. Oyuncu (Aktif)
    generateTileSet()  // 4. Oyuncu
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
