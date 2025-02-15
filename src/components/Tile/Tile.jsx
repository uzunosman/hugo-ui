import React from 'react';
import '../../assets/css/components/Tile.css';

const Tile = ({ value, color, onClick, index, isJoker, isOkey }) => {
    const handleDragStart = (e) => {
        try {
            const rect = e.target.getBoundingClientRect();
            e.dataTransfer.setDragImage(e.target, rect.width / 2, rect.height / 2);

            const tileData = {
                number: value,
                color: color,
                isJoker: isJoker,
                isOkey: isOkey
            };
            e.dataTransfer.setData('text/plain', JSON.stringify(tileData));
            e.target.style.opacity = '0.5';
        } catch (error) {
            console.error('Sürükleme başlatılırken hata:', error);
        }
    };

    const handleDragEnd = (e) => {
        // Sürükleme bittiğinde opaklığı geri alalım
        e.target.style.opacity = '1';
    };

    const handleClick = (e) => {
        if (onClick) {
            const rect = e.target.getBoundingClientRect();
            // Mouse'u taşın merkezine konumlandır
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Mouse'u merkeze taşı
            const event = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
            });
            document.dispatchEvent(event);

            onClick();
        }
    };

    return (
        <div
            className={`tile ${color?.toLowerCase() || ''} ${isJoker ? 'joker' : ''} ${isOkey ? 'okey' : ''}`}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggable={true}
            data-index={index}
        >
            <span className="tile-value">{value}</span>
            {isOkey && (
                <span className="okey-star">★</span>
            )}
        </div>
    );
};

export default Tile; 