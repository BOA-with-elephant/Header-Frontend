import { useState, useCallback, useRef } from 'react';

/**
 * React hook that manages a draggable element's position, dragging state, and optional localStorage persistence.
 *
 * Provides utilities to restore/save position, constrain coordinates within the viewport, and handlers/ref for initiating drag.
 *
 * @param {{x:number,y:number}} [initialPosition={ x: 24, y: 24 }] - Initial x/y coordinates for the element.
 * @param {string|null} [storageKey=null] - If provided, used to persist position in localStorage under this key.
 * @return {{
 *   position: {x:number,y:number},
 *   setPosition: function,
 *   isDragging: boolean,
 *   elementRef: import('react').RefObject<HTMLElement|null>,
 *   dragHandlers: { onPointerDown: function },
 *   restorePosition: function,
 *   savePosition: function,
 *   constrainPosition: function
 * }} An object with current position state and utilities:
 *   - position: current {x,y} coordinates.
 *   - setPosition: state setter for position.
 *   - isDragging: true while a drag is active.
 *   - elementRef: ref to attach to the draggable DOM element.
 *   - dragHandlers.onPointerDown: pointer-down handler that begins dragging and computes pointer offset.
 *   - restorePosition: reads and applies JSON-parsed position from localStorage (if storageKey); logs an error prefixed with "위치 복원 실패:" on parse failure.
 *   - savePosition: saves given position to localStorage (if storageKey).
 *   - constrainPosition: clamps (x,y) to the viewport with a default element size {width:60,height:60} and 10px padding.
 */
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