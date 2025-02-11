import React from 'react';
import CenterTile from '../CenterTile/CenterTile';
import '../../assets/css/components/CenterArea.css';

const CenterArea = () => {
    const centerTiles = [
        { value: '', color: 'black', isClosed: true },
        { value: '3', color: 'red', isClosed: false }
    ];

    return (
        <div className="center-area">
            <div className="center-tiles">
                {centerTiles.map((tile, index) => (
                    <CenterTile
                        key={index}
                        value={tile.value}
                        color={tile.color}
                        isClosed={tile.isClosed}
                    />
                ))}
            </div>
        </div>
    );
};

export default CenterArea; 