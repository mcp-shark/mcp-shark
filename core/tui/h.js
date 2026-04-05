/**
 * JSX-free helper for React.createElement
 * Keeps TUI code readable without requiring a build step.
 */
import { Fragment, createElement } from 'react';

export const h = createElement;
export const F = Fragment;
