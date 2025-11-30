import anime from 'animejs';

/**
 * Animation utilities for modernizing the UI with anime.js
 */

/**
 * Stagger animation for list items
 */
export const staggerIn = (selector, options = {}) => {
  return anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: options.duration || 400,
    delay: anime.stagger(options.delay || 50),
    easing: options.easing || 'easeOutExpo',
    ...options,
  });
};

/**
 * Fade in animation
 */
export const fadeIn = (selector, options = {}) => {
  return anime({
    targets: selector,
    opacity: [0, 1],
    duration: options.duration || 300,
    easing: options.easing || 'easeOutQuad',
    ...options,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (selector, options = {}) => {
  return anime({
    targets: selector,
    opacity: [1, 0],
    duration: options.duration || 300,
    easing: options.easing || 'easeInQuad',
    ...options,
  });
};

/**
 * Slide in from right
 */
export const slideInRight = (selector, options = {}) => {
  return anime({
    targets: selector,
    translateX: [options.width || 600, 0],
    opacity: [0, 1],
    duration: options.duration || 400,
    easing: options.easing || 'easeOutExpo',
    ...options,
  });
};

/**
 * Slide in from left
 */
export const slideInLeft = (selector, options = {}) => {
  return anime({
    targets: selector,
    translateX: [-(options.width || 600), 0],
    opacity: [0, 1],
    duration: options.duration || 400,
    easing: options.easing || 'easeOutExpo',
    ...options,
  });
};

/**
 * Slide out to right
 */
export const slideOutRight = (selector, options = {}) => {
  return anime({
    targets: selector,
    translateX: [0, options.width || 600],
    opacity: [1, 0],
    duration: options.duration || 300,
    easing: options.easing || 'easeInExpo',
    ...options,
  });
};

/**
 * Scale in animation
 */
export const scaleIn = (selector, options = {}) => {
  return anime({
    targets: selector,
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: options.duration || 300,
    easing: options.easing || 'easeOutBack',
    ...options,
  });
};

/**
 * Scale out animation
 */
export const scaleOut = (selector, options = {}) => {
  return anime({
    targets: selector,
    scale: [1, 0.9],
    opacity: [1, 0],
    duration: options.duration || 200,
    easing: options.easing || 'easeInBack',
    ...options,
  });
};

/**
 * Tab indicator animation
 */
export const animateTabIndicator = (selector, options = {}) => {
  return anime({
    targets: selector,
    translateX: options.translateX || 0,
    width: options.width || 'auto',
    duration: options.duration || 300,
    easing: options.easing || 'easeOutExpo',
    ...options,
  });
};

/**
 * Hover scale animation
 */
export const hoverScale = (selector, scale = 1.05, options = {}) => {
  return anime({
    targets: selector,
    scale: scale,
    duration: options.duration || 200,
    easing: options.easing || 'easeOutQuad',
    ...options,
  });
};

/**
 * Pulse animation
 */
export const pulse = (selector, options = {}) => {
  return anime({
    targets: selector,
    scale: [1, 1.1, 1],
    duration: options.duration || 600,
    easing: options.easing || 'easeInOutQuad',
    loop: options.loop || false,
    ...options,
  });
};

/**
 * Shake animation
 */
export const shake = (selector, options = {}) => {
  return anime({
    targets: selector,
    translateX: [0, -10, 10, -10, 10, 0],
    duration: options.duration || 500,
    easing: options.easing || 'easeInOutQuad',
    ...options,
  });
};
