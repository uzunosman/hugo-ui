import React, { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import PlayerPanel from './PlayerPanel';
import TileHolder from './TileHolder';
import CenterArea from './CenterArea';

const GameBoard = () => {
    const [gameState, setGameState] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [gameId, setGameId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // SignalR bağlantısını başlat
        gameService.start();

        // Oyun olaylarını dinle
        gameService.onGameStateUpdated((state) => {
            setGameState(state);
            setError('');
        });

        gameService.onError((message) => {
            setError(message);
        });

        return () => {
            // Bileşen unmount olduğunda bağlantıyı kapat
            gameService.connection.stop();
        };
    }, []);

    const handleCreateGame = async () => {
        try {
            await gameService.createGame(playerName);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleJoinGame = async () => {
        try {
            await gameService.joinGame(gameId, playerName);
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

    if (!gameState) {
        return (
            <div className="game-setup">
                <h2>Hugo Oyunu</h2>
                {error && <div className="error">{error}</div>}
                <div>
                    <input
                        type="text"
                        placeholder="Oyuncu Adı"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button onClick={handleCreateGame}>Yeni Oyun Oluştur</button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Oyun ID"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                    />
                    <button onClick={handleJoinGame}>Oyuna Katıl</button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-board">
            {error && <div className="error">{error}</div>}

            {/* Oyuncu Panelleri */}
            {gameState.otherPlayers.map((player, index) => (
                <PlayerPanel
                    key={index}
                    name={player.name}
                    stoneCount={player.stoneCount}
                    isCurrentPlayer={false}
                    position={index}
                />
            ))}

            {/* Merkez Alan */}
            <CenterArea
                okeyStone={gameState.okeyStone}
                isHugoTurn={gameState.isHugoTurn}
                currentTurn={gameState.currentTurn}
                onDrawStone={handleDrawStone}
                canDrawStone={gameState.currentPlayer}
            />

            {/* Oyuncunun Taşları */}
            <TileHolder
                stones={gameState.yourStones}
                onThrowStone={handleThrowStone}
                isCurrentPlayer={gameState.currentPlayer}
            />

            {/* Açılan Perler */}
            <div className="opened-pers">
                {gameState.openedPers.map((per, index) => (
                    <div key={index} className="per">
                        {per.stones.map((stone, i) => (
                            <div key={i} className="stone">
                                {stone.number} - {stone.color}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameBoard; 