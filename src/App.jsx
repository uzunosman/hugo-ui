import React, { useState, useCallback } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import './assets/css/global.css';

// Seri ve grup taşları tespit etme fonksiyonu
const findSeries = (tiles, startIndex) => {
  const startTile = tiles[startIndex];
  if (!startTile) return [];

  // Önce aynı sayıdan farklı renkleri kontrol et (grup)
  const sameNumberGroup = [];
  tiles.forEach((tile, index) => {
    if (tile && tile.value === startTile.value && tile.color !== startTile.color) {
      sameNumberGroup.push(index);
    }
  });

  // Eğer aynı sayıdan 2 veya daha fazla farklı renk varsa (başlangıç taşıyla birlikte 3 veya 4 taş)
  if (sameNumberGroup.length >= 2) {
    sameNumberGroup.push(startIndex); // Başlangıç taşını da ekle
    // En fazla 4 taş olacak şekilde sınırla
    return sameNumberGroup.slice(0, 4);
  }

  // Grup bulunamadıysa seri kontrolü yap
  const series = [startIndex];

  // Sağa doğru kontrol
  let rightIndex = startIndex + 1;
  while (rightIndex < tiles.length && tiles[rightIndex] &&
    (tiles[rightIndex].value === String(parseInt(startTile.value) + series.length) ||
      tiles[rightIndex].value === String(parseInt(startTile.value) - series.length)) &&
    tiles[rightIndex].color === startTile.color) {
    series.push(rightIndex);
    rightIndex++;
  }

  // Sola doğru kontrol
  let leftIndex = startIndex - 1;
  while (leftIndex >= 0 && tiles[leftIndex] &&
    (tiles[leftIndex].value === String(parseInt(startTile.value) + series.length) ||
      tiles[leftIndex].value === String(parseInt(startTile.value) - series.length)) &&
    tiles[leftIndex].color === startTile.color) {
    series.unshift(leftIndex);
    leftIndex--;
  }

  return series;
};

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
  const [selectedSeries, setSelectedSeries] = useState(null);

  const [playerTiles, setPlayerTiles] = useState([
    generateTileSet(), // 3. Oyuncu
    generateTileSet(), // 2. Oyuncu
    generateTileSet(), // 1. Oyuncu (Aktif)
    generateTileSet()  // 4. Oyuncu
  ]);

  const handleTileClick = (playerIndex, tileIndex) => {
    console.log(`Player ${playerIndex} clicked tile ${tileIndex}`);
  };

  const handleSeriesSelect = useCallback((tileIndex) => {
    const series = findSeries(playerTiles[currentPlayer], tileIndex);
    if (series.length > 1) {
      setSelectedSeries(series);
      return true;
    }
    return false;
  }, [currentPlayer, playerTiles]);

  const handleTileMove = (sourceIndex, targetIndex, isSeriesMove = false) => {
    // Eğer seri taşınıyorsa ve seçili seri yoksa işlemi iptal et
    if (isSeriesMove && !selectedSeries) {
      return;
    }

    // Aktif oyuncunun taşlarını kopyala
    const currentPlayerTiles = [...playerTiles[currentPlayer]];

    if (isSeriesMove && selectedSeries) {
      // Seriyi taşı
      const seriesToMove = selectedSeries.map(index => ({ ...currentPlayerTiles[index] }));
      const offset = targetIndex - sourceIndex;

      // Hedef pozisyonları kontrol et
      const targetPositions = selectedSeries.map(index => index + offset);
      if (targetPositions.some(pos => pos < 0 || pos >= currentPlayerTiles.length)) {
        return;
      }

      // Eski pozisyonları temizle
      selectedSeries.forEach(index => {
        currentPlayerTiles[index] = null;
      });

      // Yeni pozisyonlara yerleştir
      seriesToMove.forEach((tile, i) => {
        currentPlayerTiles[targetPositions[i]] = tile;
      });

      setSelectedSeries(null);
    } else {
      // Eğer taş aynı yere bırakılıyorsa hiçbir şey yapma
      if (sourceIndex === targetIndex) {
        return;
      }

      // Sürüklenen taşı al ve eski konumunu temizle
      const movedTile = { ...currentPlayerTiles[sourceIndex] };
      currentPlayerTiles[sourceIndex] = null;

      // Hedef konumda taş var mı kontrol et
      if (currentPlayerTiles[targetIndex]) {
        // İlk önce tercih edilen yönde kaydırmayı dene
        if (sourceIndex < targetIndex) {
          // Sağa kaydırmayı dene
          let emptyIndex = targetIndex;
          while (emptyIndex < currentPlayerTiles.length && currentPlayerTiles[emptyIndex]) {
            emptyIndex++;
          }

          // Sağa kaydırma mümkün değilse, sola kaydır
          if (emptyIndex >= currentPlayerTiles.length) {
            emptyIndex = targetIndex;
            while (emptyIndex >= 0 && currentPlayerTiles[emptyIndex]) {
              emptyIndex--;
            }
            // Sola kaydırma yap
            if (emptyIndex >= 0) {
              for (let i = emptyIndex; i < targetIndex; i++) {
                currentPlayerTiles[i] = currentPlayerTiles[i + 1] ? { ...currentPlayerTiles[i + 1] } : null;
              }
            }
          } else {
            // Sağa kaydırma yap
            for (let i = emptyIndex; i > targetIndex; i--) {
              currentPlayerTiles[i] = currentPlayerTiles[i - 1] ? { ...currentPlayerTiles[i - 1] } : null;
            }
          }
        } else {
          // Sola kaydırmayı dene
          let emptyIndex = targetIndex;
          while (emptyIndex >= 0 && currentPlayerTiles[emptyIndex]) {
            emptyIndex--;
          }

          // Sola kaydırma mümkün değilse, sağa kaydır
          if (emptyIndex < 0) {
            emptyIndex = targetIndex;
            while (emptyIndex < currentPlayerTiles.length && currentPlayerTiles[emptyIndex]) {
              emptyIndex++;
            }
            // Sağa kaydırma yap
            if (emptyIndex < currentPlayerTiles.length) {
              for (let i = emptyIndex; i > targetIndex; i--) {
                currentPlayerTiles[i] = currentPlayerTiles[i - 1] ? { ...currentPlayerTiles[i - 1] } : null;
              }
            }
          } else {
            // Sola kaydırma yap
            for (let i = emptyIndex; i < targetIndex; i++) {
              currentPlayerTiles[i] = currentPlayerTiles[i + 1] ? { ...currentPlayerTiles[i + 1] } : null;
            }
          }
        }
      }

      // Sürüklenen taşı hedef konuma yerleştir
      currentPlayerTiles[targetIndex] = movedTile;
    }

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
        onSeriesSelect={handleSeriesSelect}
        selectedSeries={selectedSeries}
      />
    </div>
  );
}

export default App;
