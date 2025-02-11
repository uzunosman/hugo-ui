import React, { useRef, useEffect } from 'react';
import '../../assets/css/components/Tile.css';

const Tile = ({ value, color, onClick, index, onSeriesSelect, isPartOfSeries }) => {
    const longPressTimer = useRef(null);
    const isLongPress = useRef(false);
    const tileRef = useRef(null);

    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    const handleMouseDown = (e) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            if (onSeriesSelect) {
                onSeriesSelect(index);
            }
        }, 1500); // 1.5 saniye
    };

    const handleMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
        if (!isLongPress.current && onClick) {
            onClick();
        }
    };

    const createDragImage = (e) => {
        if (!isPartOfSeries) return;

        // Seri için özel bir drag image oluştur
        const dragContainer = document.createElement('div');
        dragContainer.style.position = 'absolute';
        dragContainer.style.top = '-1000px';
        dragContainer.style.display = 'flex';
        dragContainer.style.gap = '1px';
        dragContainer.style.transform = 'translateY(-50%)';

        // Mevcut taşın klonunu oluştur
        const clone = tileRef.current.cloneNode(true);
        clone.style.opacity = '1';
        dragContainer.appendChild(clone);

        // Kardeş taşları bul ve ekle
        const parent = tileRef.current.closest('.tile-holder');
        if (parent) {
            const allTiles = parent.querySelectorAll('.tile.series');
            allTiles.forEach(tile => {
                if (tile !== tileRef.current) {
                    const tileClone = tile.cloneNode(true);
                    tileClone.style.opacity = '1';
                    dragContainer.appendChild(tileClone);
                }
            });
        }

        document.body.appendChild(dragContainer);
        e.dataTransfer.setDragImage(dragContainer, 20, 30);
        setTimeout(() => document.body.removeChild(dragContainer), 0);
    };

    const handleDragStart = (e) => {
        try {
            createDragImage(e);

            // Sürüklenen taşın bilgilerini saklayalım
            const tileData = {
                value,
                color,
                sourceIndex: index,
                isSeriesMove: isLongPress.current
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
        isLongPress.current = false;
    };

    return (
        <div
            ref={tileRef}
            className={`tile ${color} ${isPartOfSeries ? 'series' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                }
            }}
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