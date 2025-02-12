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
    remainingTiles = [],
    onDrawTile,
    openTile,
    gameRound,
    hasDrawnTile = {}
}) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [cornerTiles, setCornerTiles] = useState({
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null
    });

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

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e, corner) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        try {
            const tileData = JSON.parse(e.dataTransfer.getData('tile'));
            setCornerTiles(prev => ({
                ...prev,
                [corner]: tileData
            }));

            // Taş bırakıldığında sırayı değiştir
            onTileMove(tileData.sourceIndex, -1); // -1, taşın köşeye bırakıldığını belirtir
        } catch (error) {
            console.error('Taş bırakma sırasında hata:', error);
        }
    };

    return (
        <>
            {/* Player Panels */}
            {players.map((player, index) => (
                <PlayerPanel
                    key={index}
                    name={player.name}
                    score={player.score}
                    position={['top', 'right', 'bottom', 'left'][index]}
                    isCurrentPlayer={index === currentPlayer}
                    timeLeft={index === currentPlayer ? timeLeft : null}
                />
            ))}

            <div className="game-board">
                <div className="board-content">
                    {/* Köşe Bırakma Alanları */}
                    <div
                        className="tile-drop-zone top-left"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'topLeft')}
                    />
                    <div
                        className="tile-drop-zone top-right"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'topRight')}
                    />
                    <div
                        className="tile-drop-zone bottom-left"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'bottomLeft')}
                    />
                    <div
                        className="tile-drop-zone bottom-right"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'bottomRight')}
                    />

                    {/* Center Area */}
                    <CenterArea
                        remainingTiles={remainingTiles}
                        onDrawTile={onDrawTile}
                        openTile={openTile}
                        gameRound={gameRound}
                        canDrawTile={!hasDrawnTile[currentPlayer]}
                    />
                </div>
            </div>

            {/* Current Player's Tiles */}
            <TileHolder
                tiles={playerTiles[currentPlayer]}
                onTileClick={(tileIndex) => onTileClick(currentPlayer, tileIndex)}
                onTileMove={onTileMove}
            />
        </>
    );
};

export default GameBoard; 