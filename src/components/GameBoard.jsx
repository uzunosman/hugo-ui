import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PlayerPanel from './PlayerPanel';
import CenterArea from './CenterArea';
import PlayerTiles from './PlayerTiles';

const GameBoard = ({
    players,
    currentPlayer,
    playerTiles,
    remainingTiles,
    onTileClick,
    onTileMove,
    onDrawTile,
    openTile,
    gameRound,
    hasDrawnTile,
    discardedTiles
}) => {

    const renderDiscardedTiles = (corner) => {
        return discardedTiles[corner].map((tile, index) => (
            <div
                key={`${corner}-${index}`}
                className={`discarded-tile ${corner}`}
                style={{
                    backgroundColor: tile.color,
                    transform: `rotate(${tile.rotation}deg)`
                }}
            >
                {tile.number}
            </div>
        ));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="game-board">
                {/* Köşelere atılan taşlar */}
                <div className="discarded-tiles-container">
                    <div className="discarded-tiles top-left">{renderDiscardedTiles('topLeft')}</div>
                    <div className="discarded-tiles top-right">{renderDiscardedTiles('topRight')}</div>
                    <div className="discarded-tiles bottom-left">{renderDiscardedTiles('bottomLeft')}</div>
                    <div className="discarded-tiles bottom-right">{renderDiscardedTiles('bottomRight')}</div>
                </div>

                {/* Mevcut içerik */}
                <PlayerPanel position="top" player={players[0]} isCurrentPlayer={currentPlayer === 0} />
                <PlayerPanel position="right" player={players[1]} isCurrentPlayer={currentPlayer === 1} />
                <PlayerPanel position="left" player={players[3]} isCurrentPlayer={currentPlayer === 3} />
                <PlayerPanel position="current-player" player={players[2]} isCurrentPlayer={currentPlayer === 2} />

                <CenterArea
                    remainingTiles={remainingTiles}
                    onDrawTile={onDrawTile}
                    openTile={openTile}
                    currentPlayer={currentPlayer}
                    gameRound={gameRound}
                    hasDrawnTile={hasDrawnTile}
                />

                <PlayerTiles
                    tiles={playerTiles[currentPlayer]}
                    onTileClick={onTileClick}
                    onTileMove={onTileMove}
                />
            </div>
        </DndProvider>
    );
};

export default GameBoard; 