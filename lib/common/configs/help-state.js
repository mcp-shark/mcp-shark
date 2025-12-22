import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { getHelpStatePath, prepareAppDataSpaces } from './paths.js';

export function readHelpState() {
  try {
    const helpStatePath = getHelpStatePath();
    if (existsSync(helpStatePath)) {
      const content = readFileSync(helpStatePath, 'utf8');
      const state = JSON.parse(content);
      // Ensure we have the expected structure
      return {
        dismissed: state.dismissed || false,
        tourCompleted: state.tourCompleted || false,
        dismissedAt: state.dismissedAt || null,
        version: state.version || '1.0.0',
      };
    }
    return {
      dismissed: false,
      tourCompleted: false,
      dismissedAt: null,
      version: '1.0.0',
    };
  } catch (_error) {
    // Error reading help state - return defaults
    return {
      dismissed: false,
      tourCompleted: false,
      dismissedAt: null,
      version: '1.0.0',
    };
  }
}

export function writeHelpState(state) {
  try {
    const helpStatePath = getHelpStatePath();
    prepareAppDataSpaces(); // Ensure directory exists

    // Merge with existing state to preserve other fields
    const existingState = readHelpState();
    const newState = {
      ...existingState,
      ...state,
      dismissedAt:
        state.dismissed || state.tourCompleted
          ? new Date().toISOString()
          : existingState.dismissedAt,
      version: '1.0.0',
    };

    writeFileSync(helpStatePath, JSON.stringify(newState, null, 2));
    return true;
  } catch (_error) {
    return false;
  }
}
