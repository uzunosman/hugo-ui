import React from 'react';
import '../../assets/css/components/CenterTile.css';

const CenterTile = ({ value, color, isClosed, remainingCount, isIndicator = false }) => {
    const className = `center-tile ${color || ''} ${isClosed ? 'closed' : ''} ${isIndicator ? 'indicator' : ''}`;

    return (
        <div className="tile-container">
            <div className={className}>
                {!isClosed && value}
            </div>
            {isClosed && remainingCount > 0 && (
                <div className="remaining-count">{remainingCount}</div>
            )}
        </div>
    );
};

export default CenterTile; 