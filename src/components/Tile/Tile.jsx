import React from 'react';
import '../../assets/css/components/Tile.css';

const Tile = ({ value, color, onClick, index }) => {
    const handleDragStart = (e) => {
        try {
            // Sürüklenen taşın bilgilerini saklayalım
            const tileData = {
                value,
                color,
                sourceIndex: index
            };
            e.dataTransfer.setData('tile', JSON.stringify(tileData));

            // Sürükleme sırasında görsel geri bildirim
            e.target.style.opacity = '0.5';
        } catch (error) {
            console.error('Sürükleme başlatılırken hata:', error);
        }
    };

    const handleDragEnd = (e) => {
        // Sürükleme bittiğinde opaklığı geri alalım
        e.target.style.opacity = '1';
    };

    return (
        <div
            className={`tile ${color}`}
            onClick={onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-index={index}
        >
            {value}
        </div>
    );
};

export default Tile; 