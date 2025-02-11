import React from 'react';
import '../../assets/css/components/PlayerPanel.css';

const PlayerPanel = ({ name, score, position, isCurrentPlayer, timeLeft }) => {
    const getTimerWidth = () => {
        if (!isCurrentPlayer || !timeLeft) return 0;

        // Yatay paneller için genişlik yüzdesi
        if (position === 'top' || position === 'bottom' || position === 'current-player') {
            return `${(timeLeft / 60) * 100}%`;
        }
        // Dikey paneller için yükseklik yüzdesi
        return '100%';
    };

    const isWarning = timeLeft <= 20;

    return (
        <div className={`player-panel ${position}`}>
            {isCurrentPlayer && (
                <div
                    className={`timer-bar ${isWarning ? 'warning' : ''}`}
                    style={{ width: getTimerWidth() }}
                />
            )}
            <div className="player-avatar" />
            <div className="player-info">
                <div className="player-name">{name}</div>
            </div>
        </div>
    );
};

export default PlayerPanel; 