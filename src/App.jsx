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
  const tiles = Array(30).fill(null);
  // Her oyuncu için sadece ilk 14 taşı doldur
  for (let i = 0; i < 14; i++) {
    tiles[i] = generateRandomTile();
  }
  return tiles;
};

function App() {
  const [players] = useState([
    { name: '3. Oyuncu', score: 0 },
    { name: '2. Oyuncu', score: 0 },
    { name: '1. Oyuncu', score: 0 },
    { name: '4. Oyuncu', score: 0 }
  ]);

  const [currentPlayer] = useState(2); // 1. Oyuncu

  const [playerTiles, setPlayerTiles] = useState([
    generateTileSet(), // 3. Oyuncu
    generateTileSet(), // 2. Oyuncu
    generateTileSet(), // 1. Oyuncu (Aktif)
    generateTileSet()  // 4. Oyuncu
  ]);

  const handleTileClick = (playerIndex, tileIndex) => {
    console.log(`Player ${playerIndex} clicked tile ${tileIndex}`);
  };

  const handleTileMove = (sourceIndex, targetIndex) => {
    // Eğer taş aynı yere bırakılıyorsa hiçbir şey yapma
    if (sourceIndex === targetIndex) {
      return;
    }

    // Aktif oyuncunun taşlarını kopyala
    const currentPlayerTiles = [...playerTiles[currentPlayer]];

    // Sürüklenen taşı al ve eski konumunu temizle
    const movedTile = { ...currentPlayerTiles[sourceIndex] };
    currentPlayerTiles[sourceIndex] = null;

    // Hedef konumda taş var mı kontrol et
    if (currentPlayerTiles[targetIndex]) {
      // Hedef konumda taş varsa, o noktadan itibaren bir boşluk oluştur
      if (sourceIndex < targetIndex) {
        // Sağa kaydırma: Hedef noktadan bir önceki pozisyona kadar taşları kaydır
        for (let i = sourceIndex; i < targetIndex; i++) {
          currentPlayerTiles[i] = currentPlayerTiles[i + 1] ? { ...currentPlayerTiles[i + 1] } : null;
        }
      } else {
        // Sola kaydırma: Hedef noktadan bir sonraki pozisyona kadar taşları kaydır
        for (let i = sourceIndex; i > targetIndex; i--) {
          currentPlayerTiles[i] = currentPlayerTiles[i - 1] ? { ...currentPlayerTiles[i - 1] } : null;
        }
      }
    }

    // Sürüklenen taşı hedef konuma yerleştir
    currentPlayerTiles[targetIndex] = movedTile;

    // State'i güncelle
    const newPlayerTiles = [...playerTiles];
    newPlayerTiles[currentPlayer] = currentPlayerTiles;
    setPlayerTiles(newPlayerTiles);
  };

  console.log('Rendering App with:', { players, currentPlayer, playerTiles });

  return (
    <div className="game-container">
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        playerTiles={playerTiles}
        onTileClick={handleTileClick}
        onTileMove={handleTileMove}
      />
    </div>
  );
}

export default App;
