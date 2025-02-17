import React from 'react';
import { useDrag } from 'react-dnd';

const Stone = ({ stone, onThrow, isActive }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'STONE',
        item: { stone },
        canDrag: isActive,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    const getStoneColor = () => {
        switch (stone.color) {
            case 0: return '#ff4444'; // Kırmızı
            case 1: return '#ffeb3b'; // Sarı
            case 2: return '#2196f3'; // Mavi
            case 3: return '#212121'; // Siyah
            default: return '#757575';
        }
    };

    return (
        <div
            ref={drag}
            className={`stone ${isDragging ? 'dragging' : ''} ${isActive ? 'active' : ''}`}
            onClick={() => isActive && onThrow()}
            style={{
                backgroundColor: getStoneColor(),
                opacity: isDragging ? 0.5 : 1,
                cursor: isActive ? 'pointer' : 'default',
                color: stone.color === 1 ? '#000' : '#fff',
                border: stone.isOkey ? '2px solid gold' : '1px solid #ccc',
                padding: '10px',
                margin: '5px',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '40px',
                userSelect: 'none',
                position: 'relative'
            }}
        >
            {stone.isJoker ? 'J' : stone.number}
            {stone.isOkey && (
                <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    fontSize: '12px',
                    color: 'gold'
                }}>
                    ★
                </span>
            )}
        </div>
    );
};

export default Stone; 