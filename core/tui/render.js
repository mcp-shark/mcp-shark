import { render } from 'ink';
/**
 * TUI Renderer — Entry point for the interactive terminal UI
 * Called by `mcp-shark tui` command
 */
import { createElement } from 'react';
import { App } from './App.js';

/**
 * Launch the interactive TUI
 * @returns {Promise<void>}
 */
export async function launchTui() {
  const { waitUntilExit } = render(createElement(App));
  await waitUntilExit();
}
