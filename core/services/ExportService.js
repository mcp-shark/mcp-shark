import { ExportFormat } from '../models/ExportFormat.js';

/**
 * Service for exporting data in various formats
 * Handles formatting business logic for CSV, TXT, and JSON exports
 */
export class ExportService {
  /**
   * Format requests as CSV
   * @param {Array} requests - Array of request objects
   * @returns {{content: string, contentType: string, extension: string}}
   */
  formatAsCsv(requests) {
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

    const content = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return { content, contentType: 'text/csv', extension: 'csv' };
  }

  /**
   * Format requests as TXT
   * @param {Array} requests - Array of request objects
   * @returns {{content: string, contentType: string, extension: string}}
   */
  formatAsTxt(requests) {
    const content = requests
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

    return { content, contentType: 'text/plain', extension: 'txt' };
  }

  /**
   * Format requests as JSON
   * @param {Array} requests - Array of request objects
   * @param {Object} serializationLib - Serialization library for BigInt handling
   * @returns {{content: string, contentType: string, extension: string}}
   */
  formatAsJson(requests, serializationLib) {
    const serialized = serializationLib.serializeBigInt(requests);
    return {
      content: JSON.stringify(serialized, null, 2),
      contentType: 'application/json',
      extension: 'json',
    };
  }

  /**
   * Export requests in the specified format
   * @param {Array} requests - Array of request objects
   * @param {string} format - Export format (csv, txt, json)
   * @param {Object} serializationLib - Serialization library for BigInt handling (required for JSON)
   * @returns {{content: string, contentType: string, extension: string}}
   */
  exportRequests(requests, format, serializationLib) {
    if (format === ExportFormat.CSV) {
      return this.formatAsCsv(requests);
    }
    if (format === ExportFormat.TXT) {
      return this.formatAsTxt(requests);
    }
    // Default to JSON
    return this.formatAsJson(requests, serializationLib);
  }
}
