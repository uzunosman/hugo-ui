import React, { useState } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import './assets/css/global.css';

// Tüm taşları oluştur
const createAllTiles = () => {
  const tiles = [];
  const colors = ['red', 'black', 'blue', 'yellow'];
  const numbers = Array.from({ length: 13 }, (_, i) => (i + 1).toString());

  // Her sayıdan 8 taş (her renkte 2'şer adet)
  colors.forEach(color => {
    numbers.forEach(number => {
      // Her renk ve sayıdan 2 adet ekle
      tiles.push({ value: number, color, id: `${color}-${number}-1` });
      tiles.push({ value: number, color, id: `${color}-${number}-2` });
    });
  });

  // 2 adet özel joker taşı ekle
  tiles.push({ value: 'J', color: 'green', id: 'joker-1' });
  tiles.push({ value: 'J', color: 'green', id: 'joker-2' });

  return tiles;
};

// Taşları karıştır
const shuffleTiles = (tiles) => {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Oyunculara taşları dağıt
const distributeTiles = () => {
  const allTiles = shuffleTiles(createAllTiles());
  const playerTiles = [[], [], [], []];
  let currentIndex = 0;

  // Her oyuncuya taş dağıt
  for (let player = 0; player < 4; player++) {
    // 1. oyuncuya (index: 2) 15 taş, diğerlerine 14 taş
    const tileCount = player === 2 ? 15 : 14;
    for (let i = 0; i < tileCount; i++) {
      playerTiles[player].push(allTiles[currentIndex]);
      currentIndex++;
    }
  }

  // Kalan taşları kapalı deste olarak döndür
  const remainingTiles = allTiles.slice(currentIndex);

  return {
    playerTiles,
    remainingTiles
  };
};

function App() {
  const [players] = useState([
    { name: '3. Oyuncu', score: 0 },    // index: 0 - Üst
    { name: '2. Oyuncu', score: 0 },    // index: 1 - Sağ
    { name: '1. Oyuncu', score: 0 },    // index: 2 - Alt (Başlangıç)
    { name: '4. Oyuncu', score: 0 }     // index: 3 - Sol
  ]);

  // Oyun sırası:
  // 1. Oyuncu (Alt/Başlangıç, index: 2)
  // 2. Oyuncu (Sağ, index: 1)
  // 3. Oyuncu (Üst, index: 0)
  // 4. Oyuncu (Sol, index: 3)

  // Oyun her zaman 1. oyuncudan (index: 2) başlar
  const [currentPlayer, setCurrentPlayer] = useState(2);

  // Oyun eli (1-9 arası)
  const [gameRound, setGameRound] = useState(1);

  // Oyun içindeki tur sayısı (her oyuncu sırasını tamamladığında artar)
  const [turnCount, setTurnCount] = useState(0);

  // Her oyuncunun taş çekme durumunu takip et
  const [hasDrawnTile, setHasDrawnTile] = useState({
    0: false, // 3. Oyuncu
    1: false, // 2. Oyuncu
    2: true,  // 1. Oyuncu - Başlangıçta true olmalı ki taş çekemesin
    3: false  // 4. Oyuncu
  });

  const [gameState, setGameState] = useState(() => {
    const { playerTiles, remainingTiles } = distributeTiles();
    return {
      playerTiles,
      remainingTiles,
      openTile: remainingTiles[0] // İlk taşı gösterge taşı olarak ayarla
    };
  });

  // Sıradaki oyuncuya geç
  const nextPlayer = () => {
    setCurrentPlayer(current => {
      const nextPlayer = current === 2 ? 1 : current === 1 ? 0 : current === 0 ? 3 : 2;

      // Eğer sıra tekrar 1. oyuncuya geliyorsa (yani bir tur tamamlandıysa)
      if (current === 3) {
        // Önce tur sayısını artır
        setTurnCount(prev => {
          const newTurnCount = prev + 1;

          // Yeni oyuncunun taş çekme hakkını sıfırla
          // İlk turda (turnCount === 0) ve ilk oyuncu (nextPlayer === 2) ise true, diğer durumlarda false
          setHasDrawnTile(prevDrawn => ({
            ...prevDrawn,
            [nextPlayer]: nextPlayer === 2 && prev === 0 // Önceki tur sayısına göre kontrol et
          }));

          return newTurnCount;
        });
      } else {
        // Tur tamamlanmadıysa normal şekilde taş çekme hakkını sıfırla
        setHasDrawnTile(prev => ({
          ...prev,
          [nextPlayer]: false
        }));
      }

      return nextPlayer;
    });
  };

  // Oyun elini bitir ve yeni ele başla
  const startNewRound = () => {
    if (gameRound < 9) {
      setGameRound(prev => prev + 1);
      setTurnCount(0);
      setCurrentPlayer(2); // Yeni el yine 1. oyuncudan başlar

      // Yeni el için taşları dağıt
      const { playerTiles, remainingTiles } = distributeTiles();
      setGameState({
        playerTiles,
        remainingTiles,
        openTile: remainingTiles[0]
      });

      // Yeni elde ilk oyuncu (1. Oyuncu, index: 2) taş çekemez
      setHasDrawnTile({
        0: false,
        1: false,
        2: true, // 1. Oyuncu başlangıçta 15 taşı olduğu için çekemez
        3: false
      });
    } else {
      // Oyun tamamen bitti
      console.log('Oyun bitti!');
    }
  };

  // Yerden taş çekme işlemi
  const handleDrawTile = () => {
    // Eğer oyuncu zaten taş çektiyse, işlemi engelle
    if (hasDrawnTile[currentPlayer]) {
      console.log('Bu turda zaten taş çektiniz!');
      return;
    }

    if (gameState.remainingTiles.length === 0) {
      console.log('Yerde taş kalmadı!');
      return;
    }

    // Kalan taşlardan bir taş al
    const drawnTile = gameState.remainingTiles[0];
    const newRemainingTiles = gameState.remainingTiles.slice(1);

    // Çekilen taşı oyuncunun taşlarına ekle
    const newPlayerTiles = [...gameState.playerTiles];
    const currentPlayerTiles = newPlayerTiles[currentPlayer];
    let emptySlotIndex = currentPlayerTiles.findIndex(tile => tile === null);

    // Boş slot yoksa sona ekle
    if (emptySlotIndex === -1) {
      emptySlotIndex = currentPlayerTiles.length;
    }

    currentPlayerTiles[emptySlotIndex] = drawnTile;

    // State'i güncelle
    setGameState({
      ...gameState,
      remainingTiles: newRemainingTiles,
      playerTiles: newPlayerTiles,
      openTile: drawnTile // Çekilen taşı gösterge taşı olarak ayarla
    });

    // Oyuncunun taş çektiğini kaydet
    setHasDrawnTile(prev => ({
      ...prev,
      [currentPlayer]: true
    }));
  };

  const handleTileClick = (playerIndex, tileIndex) => {
    console.log(`Player ${playerIndex} clicked tile ${tileIndex}`);
  };

  const handleTileMove = (sourceIndex, targetIndex) => {
    // Eğer targetIndex -1 ise, taş köşeye bırakılmıştır (taş atma işlemi)
    if (targetIndex === -1) {
      // İlk oyuncu ve ilk turda, direkt taş atabilir (taş çekme kontrolü yapılmaz)
      const isFirstPlayerFirstTurn = currentPlayer === 2 && turnCount === 0;

      // Eğer ilk oyuncunun ilk turu değilse ve oyuncu henüz taş çekmediyse, taş atamaz
      if (!hasDrawnTile[currentPlayer] && !isFirstPlayerFirstTurn) {
        console.log('Önce yerden taş çekmelisiniz!');
        return;
      }

      // Aktif oyuncunun taşlarını kopyala
      const currentPlayerTiles = [...gameState.playerTiles[currentPlayer]];

      // Sürüklenen taşı kaldır
      currentPlayerTiles[sourceIndex] = null;

      // State'i güncelle
      const newPlayerTiles = [...gameState.playerTiles];
      newPlayerTiles[currentPlayer] = currentPlayerTiles;
      setGameState({
        ...gameState,
        playerTiles: newPlayerTiles
      });

      // Sırayı değiştir
      nextPlayer();
      return;
    }

    // Eğer taş aynı yere bırakılıyorsa hiçbir şey yapma
    if (sourceIndex === targetIndex) {
      return;
    }

    // Aktif oyuncunun taşlarını kopyala
    const currentPlayerTiles = [...gameState.playerTiles[currentPlayer]];

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

    // State'i güncelle
    const newPlayerTiles = [...gameState.playerTiles];
    newPlayerTiles[currentPlayer] = currentPlayerTiles;
    setGameState({
      ...gameState,
      playerTiles: newPlayerTiles
    });
  };

  console.log('Rendering App with:', { players, currentPlayer, gameState });

  return (
    <div className="game-container">
      <GameBoard
        players={players}
        currentPlayer={currentPlayer}
        playerTiles={gameState.playerTiles}
        remainingTiles={gameState.remainingTiles}
        onTileClick={handleTileClick}
        onTileMove={handleTileMove}
        onDrawTile={handleDrawTile}
        openTile={gameState.openTile}
        gameRound={gameRound}
        hasDrawnTile={hasDrawnTile}
      />
    </div>
  );
}

export default App;
