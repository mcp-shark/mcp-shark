export function createLogsRoutes(mcpSharkLogs, broadcastLogUpdate) {
  const router = {};

  router.getLogs = (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;
    const logs = [...mcpSharkLogs].reverse().slice(offset, offset + limit);
    res.json(logs);
  };

  router.clearLogs = (req, res) => {
    mcpSharkLogs.length = 0;
    res.json({ success: true, message: 'Logs cleared' });
  };

  router.exportLogs = (req, res) => {
    try {
      const logsText = mcpSharkLogs
        .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.line}`)
        .join('\n');

      const filename = `mcp-shark-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(logsText);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export logs', details: error.message });
    }
  };

  return router;
}
