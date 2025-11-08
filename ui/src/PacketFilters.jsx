function RequestFilters({ filters, onFilterChange, stats }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #3e3e42',
        background: '#252526',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search everything (partial match)..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '300px',
          fontWeight: filters.search ? 'bold' : 'normal',
        }}
      />

      <input
        type="text"
        placeholder="MCP Server Name (e.g., my-mcp-server)..."
        value={filters.serverName || ''}
        onChange={(e) => onFilterChange({ ...filters, serverName: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '200px',
        }}
      />

      <input
        type="text"
        placeholder="Session ID (partial)..."
        value={filters.sessionId || ''}
        onChange={(e) => onFilterChange({ ...filters, sessionId: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '200px',
        }}
      />

      <select
        value={filters.direction || ''}
        onChange={(e) => onFilterChange({ ...filters, direction: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
        }}
      >
        <option value="">All Directions</option>
        <option value="request">Request</option>
        <option value="response">Response</option>
      </select>

      <input
        type="text"
        placeholder="HTTP Method (partial)..."
        value={filters.method || ''}
        onChange={(e) => onFilterChange({ ...filters, method: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '150px',
        }}
      />

      <input
        type="text"
        placeholder="JSON-RPC Method (partial)..."
        value={filters.jsonrpcMethod || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcMethod: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '200px',
        }}
      />

      <input
        type="number"
        placeholder="Status Code..."
        value={filters.statusCode || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            statusCode: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '120px',
        }}
      />

      <input
        type="text"
        placeholder="JSON-RPC ID (partial)..."
        value={filters.jsonrpcId || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcId: e.target.value || null })}
        style={{
          padding: '4px 8px',
          background: '#1e1e1e',
          border: '1px solid #3e3e42',
          color: '#d4d4d4',
          fontSize: '12px',
          fontFamily: 'monospace',
          width: '150px',
        }}
      />

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
        {stats && (
          <>
            <span style={{ color: '#858585', fontSize: '11px' }}>
              Total: <span style={{ color: '#d4d4d4' }}>{stats.total_packets || 0}</span>
            </span>
            <span style={{ color: '#858585', fontSize: '11px' }}>
              Requests: <span style={{ color: '#4ec9b0' }}>{stats.total_requests || 0}</span>
            </span>
            <span style={{ color: '#858585', fontSize: '11px' }}>
              Responses: <span style={{ color: '#ce9178' }}>{stats.total_responses || 0}</span>
            </span>
            <span style={{ color: '#858585', fontSize: '11px' }}>
              Errors: <span style={{ color: '#f48771' }}>{stats.total_errors || 0}</span>
            </span>
            <span style={{ color: '#858585', fontSize: '11px' }}>
              Sessions: <span style={{ color: '#d4d4d4' }}>{stats.unique_sessions || 0}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default RequestFilters;
