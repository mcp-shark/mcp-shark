import { colors, fonts } from './theme';

function RequestFilters({ filters, onFilterChange, stats, onExport }) {
  const handleExport = async (format = 'json') => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.serverName) queryParams.append('serverName', filters.serverName);
      if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);
      if (filters.direction) queryParams.append('direction', filters.direction);
      if (filters.method) queryParams.append('method', filters.method);
      if (filters.jsonrpcMethod) queryParams.append('jsonrpcMethod', filters.jsonrpcMethod);
      if (filters.statusCode) queryParams.append('statusCode', filters.statusCode);
      if (filters.jsonrpcId) queryParams.append('jsonrpcId', filters.jsonrpcId);
      queryParams.append('format', format);

      const response = await fetch(`/api/requests/export?${queryParams}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'csv' ? 'csv' : format === 'txt' ? 'txt' : 'json';
      a.download = `mcp-shark-traffic-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export traffic:', error);
      alert('Failed to export traffic. Please try again.');
    }
  };

  return (
    <div
      data-tour="filters"
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.borderLight}`,
        background: colors.bgCard,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search everything (partial match)..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.body,
          width: '300px',
          fontWeight: filters.search ? '500' : '400',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <input
        type="text"
        placeholder="MCP Server Name..."
        value={filters.serverName || ''}
        onChange={(e) => onFilterChange({ ...filters, serverName: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '200px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <input
        type="text"
        placeholder="Session ID..."
        value={filters.sessionId || ''}
        onChange={(e) => onFilterChange({ ...filters, sessionId: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '200px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <select
        value={filters.direction || ''}
        onChange={(e) => onFilterChange({ ...filters, direction: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.body,
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <option value="">All Directions</option>
        <option value="request">Request</option>
        <option value="response">Response</option>
      </select>

      <input
        type="text"
        placeholder="HTTP Method..."
        value={filters.method || ''}
        onChange={(e) => onFilterChange({ ...filters, method: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '150px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <input
        type="text"
        placeholder="JSON-RPC Method..."
        value={filters.jsonrpcMethod || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcMethod: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '200px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
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
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '120px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <input
        type="text"
        placeholder="JSON-RPC ID..."
        value={filters.jsonrpcId || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcId: e.target.value || null })}
        style={{
          padding: '8px 12px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.mono,
          width: '150px',
          borderRadius: '6px',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accentBlue;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentBlue}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      {/* Export Button and Stats */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
        {stats && (
          <>
            <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: fonts.body }}>
              Total:{' '}
              <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                {stats.total_packets || 0}
              </span>
            </span>
            <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: fonts.body }}>
              Requests:{' '}
              <span style={{ color: colors.accentBlue, fontWeight: '500' }}>
                {stats.total_requests || 0}
              </span>
            </span>
            <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: fonts.body }}>
              Responses:{' '}
              <span style={{ color: colors.accentGreen, fontWeight: '500' }}>
                {stats.total_responses || 0}
              </span>
            </span>
            <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: fonts.body }}>
              Errors:{' '}
              <span style={{ color: colors.error, fontWeight: '500' }}>
                {stats.total_errors || 0}
              </span>
            </span>
            <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: fonts.body }}>
              Sessions:{' '}
              <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                {stats.unique_sessions || 0}
              </span>
            </span>
          </>
        )}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            marginLeft: '12px',
            paddingLeft: '12px',
            borderLeft: `1px solid ${colors.borderLight}`,
          }}
        >
          <button
            onClick={() => handleExport('json')}
            style={{
              padding: '8px 14px',
              background: colors.buttonPrimary,
              border: 'none',
              color: colors.textInverse,
              fontSize: '12px',
              fontFamily: fonts.body,
              fontWeight: '500',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: `0 2px 4px ${colors.shadowSm}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.buttonPrimaryHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 8px ${colors.shadowMd}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonPrimary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadowSm}`;
            }}
            title="Export as JSON"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <select
            onChange={(e) => handleExport(e.target.value)}
            value=""
            style={{
              padding: '8px 10px',
              background: colors.buttonSecondary,
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
              fontSize: '11px',
              fontFamily: fonts.body,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.accentBlue;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.borderLight;
            }}
          >
            <option value="" disabled>
              Format
            </option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default RequestFilters;
