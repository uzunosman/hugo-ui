import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import PlayerPanel from '../PlayerPanel/PlayerPanel';
import TileHolder from '../TileHolder/TileHolder';
import CenterArea from '../CenterArea/CenterArea';
import Tile from '../Tile/Tile';
import '../../assets/css/components/GameBoard.css';
import * as signalR from '@microsoft/signalr';

const GameBoard = () => {
    const [gameState, setGameState] = useState({
        totalPlayers: 0,
        otherPlayers: [],
        isGameStarted: false,
        currentPlayer: null,
        yourStones: []
    });
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isFirstPlayer, setIsFirstPlayer] = useState(false);
    const [discardedTiles, setDiscardedTiles] = useState({
        topLeft: [],
        topRight: [],
        bottomLeft: [],
        bottomRight: []
    });
    const [localStones, setLocalStones] = useState([]);

    useEffect(() => {
        // URL'den parametreleri al
        const params = new URLSearchParams(window.location.search);
        const roomIdFromUrl = params.get('roomId');
        const playerNameFromUrl = params.get('name');
        const positionFromUrl = parseInt(params.get('position'));

        if (!roomIdFromUrl || !playerNameFromUrl) {
            setError('Geçersiz URL. Lütfen doğru linki kullanın.');
            return;
        }

        setRoomId(roomIdFromUrl);
        setPlayerName(playerNameFromUrl);

        let isComponentMounted = true;
        let retryCount = 0;
        const maxRetries = 3;

        // SignalR bağlantısını başlat ve event dinleyicilerini ekle
        const setupConnection = async () => {
            try {
                if (!isComponentMounted) return;

                console.log('SignalR bağlantısı başlatılıyor...');
                await gameService.start();
                console.log('SignalR bağlantısı başarılı');

                // Event handler'ları ayarla
                setupEventHandlers();

                // Bağlantı başarılı olduktan sonra odaya katıl
                try {
                    console.log('Odaya katılma denemesi yapılıyor...');
                    await gameService.joinGame(roomIdFromUrl, playerNameFromUrl);
                    console.log('Odaya katılım başarılı');
                    setIsJoined(true);
                    setError('');

                    // Oyun durumunu al
                    const gameState = await gameService.getGameState(roomIdFromUrl);
                    if (gameState) {
                        handleGameStateUpdate(gameState);
                    }
                } catch (joinError) {
                    console.error('Odaya katılma hatası:', joinError);
                    setError(`Odaya katılma hatası: ${joinError.message}`);
                    return;
                }
            } catch (err) {
                console.error('Bağlantı hatası:', err);
                if (isComponentMounted) {
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        setError(`Sunucuya bağlanılamadı. ${maxRetries - retryCount + 1}. deneme yapılıyor...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        if (isComponentMounted) {
                            setupConnection();
                        }
                    } else {
                        setError('Sunucuya bağlanılamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
                    }
                }
            }
        };

        const setupEventHandlers = () => {
            // Bağlantı koptuğunda
            gameService.connection.onclose(async () => {
                console.log('SignalR bağlantısı kapandı');
                if (isComponentMounted) {
                    setError('Bağlantı koptu. Yeniden bağlanılıyor...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    if (isComponentMounted) {
                        retryCount = 0;
                        setupConnection();
                    }
                }
            });

            // Oyun durumu güncellendiğinde
            gameService.onGameStateUpdated((state) => {
                if (!isComponentMounted) return;
                handleGameStateUpdate(state);
            });

            // Oyuncu katıldığında
            gameService.onPlayerJoined((data) => {
                console.log(`${data.name} oyuna katıldı (Pozisyon: ${data.position + 1})`);
                gameService.getGameState(roomIdFromUrl).then(handleGameStateUpdate);
            });

            // Diğer event handler'lar
            gameService.onError((message) => {
                console.error('Oyun hatası:', message);
                setError(message);
            });

            gameService.onGameStarted((state) => {
                console.log('Oyun başlatıldı:', state);
                if (state) {
                    // Taşları sırala
                    if (state.yourStones) {
                        state.yourStones.sort((a, b) => {
                            if (a.color !== b.color) {
                                return a.color - b.color;
                            }
                            return a.number - b.number;
                        });
                    }
                    setLocalStones(state.yourStones || []);
                    handleGameStateUpdate({
                        ...state,
                        stones: state.yourStones,
                        players: state.players || [],
                        totalPlayers: state.totalPlayers || 4,
                        isGameStarted: true
                    });
                }
            });
        };

        const handleGameStateUpdate = (state) => {
            if (!state || !isComponentMounted) return;

            console.log('Game state güncellendi:', state);

            // Tüm oyuncuları al
            const allPlayers = [...(state.players || [])];
            console.log('Tüm oyuncular:', allPlayers);

            // Oyuncuları pozisyonlarına göre sırala
            allPlayers.sort((a, b) => a.position - b.position);

            // Mevcut oyuncuyu ve diğer oyuncuları ayır
            const currentPlayerData = allPlayers.find(p => p.name === playerNameFromUrl);
            const otherPlayers = allPlayers.filter(p => p.name !== playerNameFromUrl);

            console.log('Mevcut oyuncu:', currentPlayerData);
            console.log('Diğer oyuncular:', otherPlayers);

            setGameState(prevState => {
                const newState = {
                    ...prevState,
                    position: currentPlayerData?.position ?? positionFromUrl,
                    totalPlayers: state.totalPlayers || allPlayers.length,
                    otherPlayers: otherPlayers,
                    isGameStarted: state.isGameStarted || false,
                    currentPlayer: state.currentPlayer,
                    yourStones: state.stones || [],
                    remainingStoneCount: state.remainingStoneCount,
                    indicatorStone: state.indicatorStone,
                    okeyStone: state.okeyStone
                };
                console.log('Yeni game state:', newState);
                return newState;
            });

            // Taşları güncelle
            if (state.stones) {
                setLocalStones(state.stones);
            }

            // Atılan taşları güncelle
            if (state.discardedTiles) {
                setDiscardedTiles(state.discardedTiles);
            }

            setError('');

            // İlk oyuncu kontrolü
            if (currentPlayerData?.position === 0 || positionFromUrl === 0) {
                setIsFirstPlayer(true);
            }
        };

        // Bağlantıyı başlat
        setupConnection();

        return () => {
            isComponentMounted = false;
            if (gameService.connection && gameService.connection.state === signalR.HubConnectionState.Connected) {
                gameService.connection.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (!gameState?.currentPlayer) return;

        setTimeLeft(60);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState?.currentPlayer]);

    useEffect(() => {
        if (gameState.yourStones) {
            setLocalStones(gameState.yourStones);
        }
    }, [gameState.yourStones]);

    const handleJoinGame = async () => {
        if (!playerName) {
            setError('Lütfen oyuncu adınızı girin');
            return;
        }
        try {
            await gameService.joinGame(roomId, playerName);
            setIsJoined(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStartGame = async () => {
        try {
            console.log('Oyun başlatma isteği gönderiliyor - RoomId:', roomId);
            if (!roomId) {
                setError('Oda ID bulunamadı!');
                return;
            }

            if (!gameService.connection || gameService.connection.state !== signalR.HubConnectionState.Connected) {
                console.log('SignalR bağlantısı kuruluyor...');
                await gameService.start();
            }

            console.log('StartGame çağrısı yapılıyor...');
            await gameService.startGame(roomId);
            console.log('Oyun başlatma isteği başarılı');
            setError('');
        } catch (err) {
            console.error('Oyun başlatma hatası:', err);
            setError(`Oyun başlatılamadı: ${err.message}`);
        }
    };

    const handleDrawStone = async () => {
        try {
            await gameService.drawStone();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleThrowStone = async (stone) => {
        try {
            await gameService.throwStone(stone);
        } catch (err) {
            setError(err.message);
        }
    };

    // Oyuncunun köşesini belirle
    const getPlayerCorner = (playerIndex) => {
        const cornerMap = {
            0: 'topLeft',     // 3. oyuncu
            1: 'topRight',    // 2. oyuncu
            2: 'bottomRight', // 1. oyuncu
            3: 'bottomLeft'   // 4. oyuncu
        };
        return cornerMap[playerIndex];
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = async (e, corner) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        try {
            const stoneData = JSON.parse(e.dataTransfer.getData('text/plain'));

            // Eğer oyun sırası bizde değilse
            if (gameState.currentPlayer !== gameState.position) {
                setError('Sıra sizde değil!');
                return;
            }

            // Eğer ilk oyuncuysak ve taş çekmeye çalışıyorsak
            if (gameState.position === 0 && gameState.yourStones.length === 15) {
                await handleThrowStone(stoneData);
            } else {
                setError('Önce taş atmalısınız!');
            }
        } catch (err) {
            console.error('Taş atma hatası:', err);
            setError('Taş atma işlemi başarısız: ' + err.message);
        }
    };

    const handleTileMove = (sourceIndex, targetIndex) => {
        // İstaka üzerindeki taş hareketleri için sıra kontrolü yapmıyoruz
        const newStones = [...localStones];
        const stone = newStones[sourceIndex];
        newStones[sourceIndex] = newStones[targetIndex];
        newStones[targetIndex] = stone;
        setLocalStones(newStones);
    };

    // Atılan taşları render et
    const renderDiscardedTiles = (corner) => {
        const tiles = discardedTiles[corner];
        if (!tiles || tiles.length === 0) return null;

        const lastTile = tiles[tiles.length - 1];
        return (
            <div key={`${corner}-last`} className={`discarded-tile ${corner}`}>
                <Tile
                    value={lastTile.value}
                    color={lastTile.color}
                    isDiscarded={true}
                />
            </div>
        );
    };

    // Giriş ekranını kaldır
    if (!roomId || !playerName) {
        return (
            <div className="error-screen">
                <h2>Hata</h2>
                <p>{error || 'Geçersiz URL. Lütfen doğru linki kullanın.'}</p>
            </div>
        );
    }

    return (
        <div className="game-container">
            {error && <div className="error-message">{error}</div>}

            {/* Oyun Durumu ve Başlat Butonu */}
            <div className="game-status">
                <div className="player-count">
                    Oyuncular: {gameState.totalPlayers}/4
                </div>
                {gameState?.isGameStarted && (
                    <div className="game-round">
                        {gameState?.currentTurn || 1}. El {gameState?.isHugoTurn ? '(Hugo)' : ''}
                    </div>
                )}
                {gameState?.totalPlayers === 4 && isFirstPlayer && !gameState?.isGameStarted && (
                    <button className="start-game-button" onClick={handleStartGame}>
                        Oyunu Başlat
                    </button>
                )}
            </div>

            <div className="game-board">
                <div className="board-content">
                    {/* Sol Oyuncu */}
                    <div className="player-panel left">
                        {gameState?.otherPlayers?.find(p => p.position === 1) && (
                            <PlayerPanel
                                name={gameState.otherPlayers.find(p => p.position === 1).name}
                                score={gameState.otherPlayers.find(p => p.position === 1).score || 0}
                                position="left"
                                isCurrentPlayer={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 1)?.id}
                                timeLeft={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 1)?.id ? timeLeft : null}
                                stoneCount={gameState.otherPlayers.find(p => p.position === 1)?.stoneCount || 0}
                                lastThrownStone={gameState.otherPlayers.find(p => p.position === 1)?.lastThrownStone}
                            />
                        )}
                    </div>

                    {/* Üst Oyuncu */}
                    <div className="player-panel top">
                        {gameState?.otherPlayers?.find(p => p.position === 2) && (
                            <PlayerPanel
                                name={gameState.otherPlayers.find(p => p.position === 2).name}
                                score={gameState.otherPlayers.find(p => p.position === 2).score || 0}
                                position="top"
                                isCurrentPlayer={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 2)?.id}
                                timeLeft={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 2)?.id ? timeLeft : null}
                                stoneCount={gameState.otherPlayers.find(p => p.position === 2)?.stoneCount || 0}
                                lastThrownStone={gameState.otherPlayers.find(p => p.position === 2)?.lastThrownStone}
                            />
                        )}
                    </div>

                    {/* Sağ Oyuncu */}
                    <div className="player-panel right">
                        {gameState?.otherPlayers?.find(p => p.position === 3) && (
                            <PlayerPanel
                                name={gameState.otherPlayers.find(p => p.position === 3).name}
                                score={gameState.otherPlayers.find(p => p.position === 3).score || 0}
                                position="right"
                                isCurrentPlayer={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 3)?.id}
                                timeLeft={gameState?.currentPlayer === gameState.otherPlayers.find(p => p.position === 3)?.id ? timeLeft : null}
                                stoneCount={gameState.otherPlayers.find(p => p.position === 3)?.stoneCount || 0}
                                lastThrownStone={gameState.otherPlayers.find(p => p.position === 3)?.lastThrownStone}
                            />
                        )}
                    </div>

                    {/* Köşe Bırakma Alanları */}
                    <div
                        className={`tile-drop-zone top-left ${getPlayerCorner(gameState.currentPlayer) === 'topLeft' ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'topLeft')}
                    />
                    <div
                        className={`tile-drop-zone top-right ${getPlayerCorner(gameState.currentPlayer) === 'topRight' ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'topRight')}
                    />
                    <div
                        className={`tile-drop-zone bottom-left ${getPlayerCorner(gameState.currentPlayer) === 'bottomLeft' ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'bottomLeft')}
                    />
                    <div
                        className={`tile-drop-zone bottom-right ${getPlayerCorner(gameState.currentPlayer) === 'bottomRight' ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'bottomRight')}
                    />

                    {/* Atılan taşlar */}
                    <div className="discarded-tiles-container">
                        <div className="discarded-tiles top-left">
                            {renderDiscardedTiles('topLeft')}
                        </div>
                        <div className="discarded-tiles top-right">
                            {renderDiscardedTiles('topRight')}
                        </div>
                        <div className="discarded-tiles bottom-left">
                            {renderDiscardedTiles('bottomLeft')}
                        </div>
                        <div className="discarded-tiles bottom-right">
                            {renderDiscardedTiles('bottomRight')}
                        </div>
                    </div>

                    {/* Merkez Alan */}
                    <CenterArea
                        remainingTiles={gameState?.remainingStoneCount || 0}
                        onDrawTile={handleDrawStone}
                        openTile={null}
                        gameRound={gameState?.currentTurn || 1}
                        canDrawTile={gameState?.isGameStarted && gameState?.currentPlayer === null}
                        isHugoTurn={gameState?.isHugoTurn || false}
                    />
                </div>
            </div>

            {/* Alt Oyuncu (Mevcut Oyuncu) */}
            <PlayerPanel
                name={playerName}
                score={0}
                position="bottom"
                isCurrentPlayer={gameState?.currentPlayer === null}
                timeLeft={gameState?.currentPlayer === null ? timeLeft : null}
                stoneCount={gameState?.yourStones?.length || 0}
                lastThrownStone={null}
            />

            {/* Mevcut Oyuncunun Taşları */}
            {localStones && (
                <TileHolder
                    tiles={localStones.map((stone, index) => {
                        const colorMap = {
                            0: 'red',
                            1: 'yellow',
                            2: 'blue',
                            3: 'black'
                        };
                        return {
                            value: stone.number,
                            color: colorMap[stone.color] || 'black',
                            isJoker: stone.isJoker,
                            isOkey: stone.isOkey,
                            index
                        };
                    })}
                    onTileClick={handleThrowStone}
                    onTileMove={handleTileMove}
                    isYourTurn={gameState.currentPlayer === null}
                />
            )}
        </div>
    );
};

export default GameBoard;