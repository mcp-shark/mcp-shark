import { useEffect, useRef } from 'react';
import anime from 'animejs';

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
  }, deps);

  return elementRef;
};

/**
 * Hook for animating on mount
 */
export const useMountAnimation = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      anime({
        targets: elementRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: options.duration || 400,
        easing: options.easing || 'easeOutExpo',
        ...options,
      });
    }
  }, []);

  return elementRef;
};

/**
 * Hook for animating on unmount
 */
export const useUnmountAnimation = (shouldUnmount, onComplete, options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (shouldUnmount && elementRef.current) {
      anime({
        targets: elementRef.current,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: options.duration || 300,
        easing: options.easing || 'easeInExpo',
        complete: onComplete,
        ...options,
      });
    }
  }, [shouldUnmount, onComplete]);

  return elementRef;
};

/**
 * Hook for staggered list animations
 */
export const useStaggerAnimation = (items, options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      anime({
        targets: containerRef.current.children,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: options.duration || 400,
        delay: anime.stagger(options.delay || 50),
        easing: options.easing || 'easeOutExpo',
        ...options,
      });
    }
  }, [items.length]);

  return containerRef;
};
