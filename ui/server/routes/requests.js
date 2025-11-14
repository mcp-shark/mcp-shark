import { serializeBigInt } from '../utils/serialization.js';
import { queryRequests } from 'mcp-shark-common/db/query.js';

export function createRequestsRoutes(db) {
  const router = {};

  router.getRequests = (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 1000;
      const offset = parseInt(req.query.offset) || 0;

      // Sanitize search parameter - convert empty strings to null
      let search = req.query.search;
      if (search !== undefined && search !== null) {
        search = String(search).trim();
        search = search.length > 0 ? search : null;
      } else {
        search = null;
      }

      // Build filters object, ensuring all values are properly typed
      const filters = {
        sessionId: (req.query.sessionId && String(req.query.sessionId).trim()) || null,
        direction: (req.query.direction && String(req.query.direction).trim()) || null,
        method: (req.query.method && String(req.query.method).trim()) || null,
        jsonrpcMethod: (req.query.jsonrpcMethod && String(req.query.jsonrpcMethod).trim()) || null,
        statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : null,
        jsonrpcId: (req.query.jsonrpcId && String(req.query.jsonrpcId).trim()) || null,
        search: search,
        serverName: (req.query.serverName && String(req.query.serverName).trim()) || null,
        startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
        endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
        limit,
        offset,
      };

      // Remove undefined values to avoid issues
      Object.keys(filters).forEach((key) => {
        if (filters[key] === undefined) {
          filters[key] = null;
        }
      });

      const requests = queryRequests(db, filters);
      res.json(serializeBigInt(requests));
    } catch (error) {
      console.error('Error in getRequests:', error);
      res.status(500).json({ error: 'Failed to query requests', details: error.message });
    }
  };

  router.getRequest = (req, res) => {
    const stmt = db.prepare('SELECT * FROM packets WHERE frame_number = ?');
    const request = stmt.get(parseInt(req.params.frameNumber));
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(serializeBigInt(request));
  };

  router.exportRequests = (req, res) => {
    try {
      // Sanitize search parameter - convert empty strings to null
      let search = req.query.search;
      if (search !== undefined && search !== null) {
        search = String(search).trim();
        search = search.length > 0 ? search : null;
      } else {
        search = null;
      }

      const filters = {
        sessionId: req.query.sessionId || null,
        direction: req.query.direction || null,
        method: req.query.method || null,
        jsonrpcMethod: req.query.jsonrpcMethod || null,
        statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : null,
        jsonrpcId: req.query.jsonrpcId || null,
        search: search,
        serverName: req.query.serverName || null,
        startTime: req.query.startTime ? BigInt(req.query.startTime) : null,
        endTime: req.query.endTime ? BigInt(req.query.endTime) : null,
        limit: 100000,
        offset: 0,
      };

      const requests = queryRequests(db, filters);
      const format = req.query.format || 'json';

      let content, contentType, extension;

      if (format === 'csv') {
        const headers = [
          'Frame',
          'Time',
          'Source',
          'Destination',
          'Protocol',
          'Length',
          'Method',
          'Status',
          'JSON-RPC Method',
          'Session ID',
          'Server Name',
        ];
        const rows = requests.map((req) => [
          req.frame_number || '',
          req.timestamp_iso || '',
          req.request?.host || '',
          req.request?.host || '',
          'HTTP',
          req.length || '',
          req.request?.method || '',
          req.response?.status_code || '',
          req.jsonrpc_method || '',
          req.session_id || '',
          req.server_name || '',
        ]);

        content = [
          headers.join(','),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          ),
        ].join('\n');
        contentType = 'text/csv';
        extension = 'csv';
      } else if (format === 'txt') {
        content = requests
          .map((req, idx) => {
            const lines = [
              `=== Request/Response #${idx + 1} (Frame ${req.frame_number || 'N/A'}) ===`,
              `Time: ${req.timestamp_iso || 'N/A'}`,
              `Session ID: ${req.session_id || 'N/A'}`,
              `Server: ${req.server_name || 'N/A'}`,
              `Direction: ${req.direction || 'N/A'}`,
              `Method: ${req.request?.method || 'N/A'}`,
              `Status: ${req.response?.status_code || 'N/A'}`,
              `JSON-RPC Method: ${req.jsonrpc_method || 'N/A'}`,
              `JSON-RPC ID: ${req.jsonrpc_id || 'N/A'}`,
              `Length: ${req.length || 0} bytes`,
              '',
              'Request:',
              JSON.stringify(req.request || {}, null, 2),
              '',
              'Response:',
              JSON.stringify(req.response || {}, null, 2),
              '',
              '---',
              '',
            ];
            return lines.join('\n');
          })
          .join('\n');
        contentType = 'text/plain';
        extension = 'txt';
      } else {
        content = JSON.stringify(serializeBigInt(requests), null, 2);
        contentType = 'application/json';
        extension = 'json';
      }

      const filename = `mcp-shark-traffic-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export traffic', details: error.message });
    }
  };

  return router;
}
