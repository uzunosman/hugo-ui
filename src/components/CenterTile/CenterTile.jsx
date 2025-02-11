import React from 'react';
import '../../assets/css/components/CenterTile.css';

const CenterTile = ({ value, color, isClosed }) => {
    return (
        <div className={`center-tile ${color} ${isClosed ? 'closed' : ''}`}>
            {!isClosed && value}
        </div>
    );
};

export default CenterTile; 