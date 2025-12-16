export async function stop(
  _req,
  res,
  restoreOriginalConfig,
  getMcpSharkProcess,
  setMcpSharkProcess,
  mcpSharkLogs,
  broadcastLogUpdate
) {
  try {
    const currentServer = getMcpSharkProcess();
    if (currentServer?.stop) {
      await currentServer.stop();
      setMcpSharkProcess(null);

      const restored = restoreOriginalConfig();

      if (restored) {
        const timestamp = new Date().toISOString();
        const restoreLog = {
          timestamp,
          type: 'stdout',
          line: '[RESTORE] Restored original config',
        };
        mcpSharkLogs.push(restoreLog);
        if (mcpSharkLogs.length > 10000) {
          mcpSharkLogs.shift();
        }
        broadcastLogUpdate(restoreLog);
      }

      res.json({ success: true, message: 'MCP Shark server stopped and config restored' });
    } else {
      res.json({ success: true, message: 'MCP Shark server was not running' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop mcp-shark server', details: error.message });
  }
}
