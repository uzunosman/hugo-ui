import React from 'react';
import '../../assets/css/components/Tile.css';

const Tile = ({ value, color, onClick }) => {
    return (
        <div
            className={`tile ${color}`}
            onClick={onClick}
        >
            {value}
        </div>
    );
};

export default Tile; 