import React, { useState, useEffect } from 'react';
import PlayerPanel from '../PlayerPanel/PlayerPanel';
import TileHolder from '../TileHolder/TileHolder';
import CenterArea from '../CenterArea/CenterArea';
import '../../assets/css/components/GameBoard.css';

const GameBoard = ({
    players,
    currentPlayer,
    playerTiles,
    onTileClick,
    onTileMove,
    onSeriesSelect,
    selectedSeries
}) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        // Oyuncu değiştiğinde süreyi sıfırla
        setTimeLeft(60);

        // Süre sayacı
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
    }, [currentPlayer]);

    return (
        <>
            {/* Player Panels */}
            {players.map((player, index) => (
                index === currentPlayer ? null : (
                    <PlayerPanel
                        key={index}
                        name={player.name}
                        score={player.score}
                        position={['top', 'right', 'bottom', 'left'][index]}
                        isCurrentPlayer={false}
                    />
                )
            ))}

            {/* Current Player Panel */}
            <PlayerPanel
                name={players[currentPlayer].name}
                score={players[currentPlayer].score}
                position="current-player"
                isCurrentPlayer={true}
                timeLeft={timeLeft}
            />

            <div className="game-board">
                <div className="board-content">
                    {/* Center Area */}
                    <CenterArea />
                </div>
            </div>

            {/* Current Player's Tiles */}
            <TileHolder
                tiles={playerTiles[currentPlayer]}
                onTileClick={(tileIndex) => onTileClick(currentPlayer, tileIndex)}
                onTileMove={onTileMove}
                onSeriesSelect={onSeriesSelect}
                selectedSeries={selectedSeries}
            />
        </>
    );
};

export default GameBoard; 