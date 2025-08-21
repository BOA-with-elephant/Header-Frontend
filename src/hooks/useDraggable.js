import { useState, useCallback, useRef } from 'react';

export function useDraggable(initialPosition = { x: 24, y: 24 }, storageKey = null) {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const elementRef = useRef(null);

    // 로컬 스토리지에서 위치 복원
    const restorePosition = useCallback(() => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    setPosition(JSON.parse(saved));
                } catch (error) {
                    console.error('위치 복원 실패:', error);
                }
            }
        }
    }, [storageKey]);

    // 위치 저장
    const savePosition = useCallback((newPosition) => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newPosition));
        }
    }, [storageKey]);

    // 화면 경계 제한
    const constrainPosition = useCallback((x, y, elementSize = { width: 60, height: 60 }) => {
        const padding = 10;
        const maxX = window.innerWidth - elementSize.width - padding;
        const maxY = window.innerHeight - elementSize.height - padding;
        
        return {
            x: Math.max(padding, Math.min(x, maxX)),
            y: Math.max(padding, Math.min(y, maxY))
        };
    }, []);

    const dragHandlers = {
        onPointerDown: (e) => {
            e.preventDefault();
            setIsDragging(true);
            
            const rect = elementRef.current?.getBoundingClientRect();
            if (rect) {
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                
                setDragOffset({
                    x: clientX - rect.left,
                    y: clientY - rect.top
                });
            }
        }
    };

    return {
        position,
        setPosition,
        isDragging,
        elementRef,
        dragHandlers,
        restorePosition,
        savePosition,
        constrainPosition
    };
}