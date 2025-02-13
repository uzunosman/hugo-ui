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

    // Oyuncunun pozisyonuna göre panel pozisyonunu belirle
    const getPlayerPosition = (position) => {
        const positions = ['bottom', 'left', 'top', 'right'];
        return positions[position];
    };

    useEffect(() => {
        // URL'den roomId'yi al
        const params = new URLSearchParams(window.location.search);
        const roomIdFromUrl = params.get('roomId');
        if (roomIdFromUrl) {
            setRoomId(roomIdFromUrl);
        } else {
            setError('Oda ID bulunamadı. Lütfen doğru linki kullanın.');
            return;
        }

        // SignalR bağlantısını başlat ve event dinleyicilerini ekle
        const setupConnection = async () => {
            try {
                await gameService.start();

                // Oyun olaylarını dinle
                gameService.onGameStateUpdated((state) => {
                    console.log('Game state güncellendi:', state);

                    // Boş isimli oyuncuları filtrele
                    const validOtherPlayers = (state?.otherPlayers || [])
                        .filter(p => p.name && p.name.trim() !== '');

                    // Mevcut oyuncunun bilgilerini ekle
                    if (state?.position !== undefined) {
                        // Eğer mevcut oyuncu validOtherPlayers içinde yoksa ekle
                        const currentPlayerExists = validOtherPlayers.some(p => p.position === state.position);
                        if (!currentPlayerExists) {
                            validOtherPlayers.push({
                                position: state.position,
                                name: playerName,
                                score: 0,
                                stoneCount: state?.yourStones?.length || 0,
                                lastThrownStone: null
                            });
                        }
                    }

                    // Pozisyona göre sırala
                    validOtherPlayers.sort((a, b) => a.position - b.position);

                    // Gerçek oyuncu sayısını hesapla
                    const realPlayerCount = validOtherPlayers.length;

                    setGameState({
                        ...state,
                        totalPlayers: realPlayerCount,
                        otherPlayers: validOtherPlayers,
                        isGameStarted: state?.isGameStarted || false,
                        currentPlayer: state?.currentPlayer || null,
                        yourStones: state?.yourStones || []
                    });

                    setError('');
                    // İlk oyuncu kontrolü (boş oyuncuyu saymadan)
                    if (state?.position === validOtherPlayers[0]?.position) {
                        setIsFirstPlayer(true);
                    }
                });

                gameService.onPlayerJoined((data) => {
                    console.log(`${data.name} oyuna katıldı (Pozisyon: ${data.position + 1})`);
                });

                gameService.onStoneThrown((stone, playerName, position) => {
                    console.log(`${playerName} (Pozisyon ${position + 1}) taş attı:`, stone);
                });

                gameService.onError((message) => {
                    console.error('Oyun hatası:', message);
                    setError(message);
                });

                gameService.onGameCreated((gameId) => {
                    console.log('Oda oluşturuldu:', gameId);
                    setIsJoined(true); // Odayı oluşturan kişi otomatik olarak katılmış sayılır
                });

            } catch (err) {
                console.error('Bağlantı hatası:', err);
                setError('Sunucuya bağlanılamadı. Tekrar deneniyor...');
            }
        };

        setupConnection();

        // Cleanup
        return () => {
            if (gameService.connection.state === signalR.HubConnectionState.Connected) {
                gameService.connection.stop();
            }
        };
    }, []);

    // Süre sayacı
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

    const handleJoinGame = async () => {
        if (!playerName) {
            setError('Lütfen oyuncu adınızı girin');
            return;
        }
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const isCreator = !urlParams.get('roomId');

            if (isCreator) {
                // Sadece odayı oluştur, otomatik katılma
                await gameService.createGame("");
                setIsJoined(false); // Oda oluşturan kişi otomatik katılmaz
            } else {
                await gameService.joinGame(roomId, playerName);
                setIsJoined(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStartGame = async () => {
        try {
            await gameService.startGame(roomId);
        } catch (err) {
            setError(err.message);
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

    // Giriş ekranı
    if (!roomId) {
        return (
            <div className="error-screen">
                <h2>Hata</h2>
                <p>{error}</p>
            </div>
        );
    }

    // Oyuna katılma ekranı
    if (!isJoined) {
        return (
            <div className="join-screen">
                <h2>Oyuna Katıl</h2>
                <p>Oda ID: {roomId}</p>
                {error && <div className="error">{error}</div>}
                <div>
                    <input
                        type="text"
                        placeholder="Oyuncu Adı"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button onClick={handleJoinGame}>Oyuna Katıl</button>
                </div>
            </div>
        );
    }

    // Oyun ekranı
    return (
        <div className="game-container">
            {error && <div className="error">{error}</div>}

            {/* Oyuncu Bilgileri ve Başlat Butonu */}
            <div className="game-status">
                <div className="player-count">
                    Oyuncular: {gameState?.totalPlayers || 0}/4
                </div>
                {gameState?.totalPlayers === 4 && isFirstPlayer && !gameState?.isGameStarted && (
                    <button className="start-game-button" onClick={handleStartGame}>
                        Oyunu Başlat
                    </button>
                )}
            </div>

            {/* Oyuncu Panelleri */}
            {[0, 1, 2, 3].map((position) => {
                const player = gameState?.otherPlayers?.find(p => p.position === position);
                const isCurrentPlayerPanel = player?.position === gameState?.position;

                return (
                    <PlayerPanel
                        key={position}
                        name={player ? player.name : 'Boş'}
                        score={player?.score || 0}
                        position={getPlayerPosition(position)}
                        isCurrentPlayer={gameState?.isGameStarted && (
                            isCurrentPlayerPanel ?
                                gameState?.currentPlayer === null :
                                gameState?.currentPlayer === player?.id
                        )}
                        timeLeft={gameState?.isGameStarted && gameState?.currentPlayer === player?.id ? timeLeft : null}
                        stoneCount={isCurrentPlayerPanel ? gameState?.yourStones?.length || 0 : player?.stoneCount || 0}
                        lastThrownStone={player?.lastThrownStone}
                    />
                );
            })}

            <div className="game-board">
                <div className="board-content">
                    {/* Merkez Alan */}
                    <CenterArea
                        remainingTiles={106 - (gameState?.totalPlayers || 0) * 14}
                        onDrawTile={handleDrawStone}
                        openTile={null}
                        gameRound={1}
                        canDrawTile={false}
                        isHugoTurn={false}
                    />
                </div>
            </div>

            {/* Oyuncunun Taşları */}
            <TileHolder
                tiles={[]}
                onTileClick={handleThrowStone}
                onTileMove={handleThrowStone}
                isYourTurn={false}
            />
        </div>
    );
};

export default GameBoard; 