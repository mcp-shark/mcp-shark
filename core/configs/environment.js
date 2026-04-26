import { homedir } from 'node:os';
import { join } from 'node:path';
import { Server } from '#core/constants/Server.js';

/**
 * Environment variable management
 * Provides validated access to environment variables with defaults
 */
export const Environment = {
  getEnv() {
    return process.env;
  },
  /**
   * Get UI server port
   * Honours UI_PORT first, then the documented MCP_SHARK_PORT alias.
   * @returns {number} UI server port (default: 9853)
   */
  getUiPort() {
    const raw = process.env.UI_PORT ?? process.env.MCP_SHARK_PORT;
    const port = Number.parseInt(raw, 10);
    return Number.isNaN(port) ? Server.DEFAULT_UI_PORT : port;
  },

  /**
   * Get MCP server port
   * @returns {number} MCP server port (default: 9851)
   */
  getMcpServerPort() {
    const port = Number.parseInt(process.env.MCP_SHARK_SERVER_PORT, 10);
    return Number.isNaN(port) ? Server.DEFAULT_MCP_SERVER_PORT : port;
  },

  /**
   * Get system PATH
   * @returns {string} System PATH environment variable
   */
  getPath() {
    return process.env.PATH || '';
  },

  /**
   * Get MCP Shark home directory
   * @returns {string} MCP Shark home path
   */
  getMcpSharkHome() {
    return process.env.MCP_SHARK_HOME || join(homedir(), '.mcp-shark');
  },

  getUserProfile() {
    return process.env.USERPROFILE || homedir();
  },

  getCodexHome() {
    return process.env.CODEX_HOME || join(homedir(), '.codex');
  },
};
