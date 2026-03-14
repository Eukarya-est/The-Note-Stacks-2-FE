import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

export const useSwipeGesture = ({ onSwipeLeft, onSwipeRight }: SwipeHandlers) => {
  const swipeState = useRef<SwipeState | null>(null);
  
  const minSwipeDistance = 50;
  const maxSwipeTime = 300;
  const maxVerticalDistance = 100;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeState.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeState.current.startX;
    const deltaY = touch.clientY - swipeState.current.startY;
    const deltaTime = Date.now() - swipeState.current.startTime;

    // Check if it's a valid horizontal swipe
    if (
      Math.abs(deltaX) > minSwipeDistance &&
      Math.abs(deltaY) < maxVerticalDistance &&
      deltaTime < maxSwipeTime
    ) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    swipeState.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Optional: could add visual feedback here
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
};
