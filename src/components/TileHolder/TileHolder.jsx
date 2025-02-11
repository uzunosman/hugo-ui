import React from 'react';
import Tile from '../Tile/Tile';
import '../../assets/css/components/TileHolder.css';

const TileHolder = ({ tiles, onTileClick }) => {
    // İlk 7 taş
    const firstRow = tiles.slice(0, 7);
    // Son 7 taş
    const secondRow = tiles.slice(7, 14);

    return (
        <div className="tile-holder-container">
            <div className="tile-holder">
                <div className="tile-row">
                    {firstRow.map((tile, index) => (
                        <Tile
                            key={index}
                            value={tile.value}
                            color={tile.color}
                            onClick={() => onTileClick(index)}
                        />
                    ))}
                </div>
                <hr className="tile-row-divider" />
                <div className="tile-row">
                    {secondRow.map((tile, index) => (
                        <Tile
                            key={index + 7}
                            value={tile.value}
                            color={tile.color}
                            onClick={() => onTileClick(index + 7)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TileHolder; 