import anime from 'animejs';
import { useEffect, useRef } from 'react';

/**
 * React hook for animating elements on mount/unmount
 */
export const useAnimation = (animationFn, deps = []) => {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && animationFn) {
      animationRef.current = animationFn(elementRef.current);
    }

    return () => {
      if (animationRef.current) {
        anime.remove(elementRef.current);
      }
    };
  }, [animationFn, ...deps]);

  return elementRef;
};

/**
 * Hook for animating on mount
 */
export const useMountAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const { duration, easing } = options;

  useEffect(() => {
    if (elementRef.current) {
      anime({
        targets: elementRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: duration || 400,
        easing: easing || 'easeOutExpo',
        ...options,
      });
    }
  }, [duration, easing, options]);

  return elementRef;
};

/**
 * Hook for animating on unmount
 */
export const useUnmountAnimation = (shouldUnmount, onComplete, options = {}) => {
  const elementRef = useRef(null);
  const { duration, easing } = options;

  useEffect(() => {
    if (shouldUnmount && elementRef.current) {
      anime({
        targets: elementRef.current,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: duration || 300,
        easing: easing || 'easeInExpo',
        complete: onComplete,
        ...options,
      });
    }
  }, [shouldUnmount, onComplete, duration, easing, options]);

  return elementRef;
};

/**
 * Hook for staggered list animations
 */
export const useStaggerAnimation = (items, options = {}) => {
  const containerRef = useRef(null);
  const { duration, delay, easing } = options;

  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      anime({
        targets: containerRef.current.children,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: duration || 400,
        delay: anime.stagger(delay || 50),
        easing: easing || 'easeOutExpo',
        ...options,
      });
    }
  }, [items.length, duration, delay, easing, options]);

  return containerRef;
};
