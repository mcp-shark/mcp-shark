import { render } from 'ink';
/**
 * TUI Renderer — Entry point for the interactive terminal UI
 * Called by `mcp-shark tui` command
 */
import { createElement } from 'react';
import { bootstrapLogger as logger } from '#core/libraries/index.js';
import { App } from './App.js';

/**
 * Launch the interactive TUI
 * @returns {Promise<void>}
 */
export async function launchTui() {
  try {
    const { waitUntilExit } = render(createElement(App));
    await waitUntilExit();
  } catch (err) {
    logger.error({ err: err.message }, 'TUI failed to start');
    throw err;
  }
}
