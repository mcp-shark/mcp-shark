/**
 * Set MCP Shark server process in state
 * @param {object} processState - Process state object
 * @param {object} server - Server instance
 */
export function setMcpSharkProcess(processState, server) {
  processState.mcpSharkServer = server;
}

/**
 * Get MCP Shark server process from state
 * @param {object} processState - Process state object
 * @returns {object|null} Server instance or null
 */
export function getMcpSharkProcess(processState) {
  return processState.mcpSharkServer;
}
