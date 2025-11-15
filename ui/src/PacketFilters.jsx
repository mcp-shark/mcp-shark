import { useEffect, useRef } from 'react';
import { colors, fonts } from './theme';
import { fadeIn } from './utils/animations';
import FilterInput from './components/PacketFilters/FilterInput';
import ExportControls from './components/PacketFilters/ExportControls';
import anime from 'animejs';

function RequestFilters({ filters, onFilterChange, stats, onExport }) {
  const filtersRef = useRef(null);

  useEffect(() => {
    if (filtersRef.current) {
      fadeIn(filtersRef.current, { duration: 400 });
    }
  }, []);

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
      ref={filtersRef}
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
      <FilterInput
        type="text"
        placeholder="🔍 Search everything (partial match)..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value || null })}
        style={{
          width: '300px',
          fontWeight: filters.search ? '500' : '400',
        }}
      />

      <FilterInput
        type="text"
        placeholder="MCP Server Name..."
        value={filters.serverName || ''}
        onChange={(e) => onFilterChange({ ...filters, serverName: e.target.value || null })}
        style={{ width: '200px' }}
      />

      <FilterInput
        type="text"
        placeholder="Session ID..."
        value={filters.sessionId || ''}
        onChange={(e) => onFilterChange({ ...filters, sessionId: e.target.value || null })}
        style={{ width: '200px' }}
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
          anime({
            targets: e.currentTarget,
            borderColor: colors.accentBlue,
            boxShadow: [`0 0 0 0px ${colors.accentBlue}20`, `0 0 0 3px ${colors.accentBlue}20`],
            duration: 200,
            easing: 'easeOutQuad',
          });
        }}
        onBlur={(e) => {
          anime({
            targets: e.currentTarget,
            borderColor: colors.borderLight,
            boxShadow: 'none',
            duration: 200,
            easing: 'easeOutQuad',
          });
        }}
      >
        <option value="">All Directions</option>
        <option value="request">Request</option>
        <option value="response">Response</option>
      </select>

      <FilterInput
        type="text"
        placeholder="HTTP Method..."
        value={filters.method || ''}
        onChange={(e) => onFilterChange({ ...filters, method: e.target.value || null })}
        style={{ width: '150px' }}
      />

      <FilterInput
        type="text"
        placeholder="JSON-RPC Method..."
        value={filters.jsonrpcMethod || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcMethod: e.target.value || null })}
        style={{ width: '200px' }}
      />

      <FilterInput
        type="number"
        placeholder="Status Code..."
        value={filters.statusCode || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            statusCode: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        style={{ width: '120px' }}
      />

      <FilterInput
        type="text"
        placeholder="JSON-RPC ID..."
        value={filters.jsonrpcId || ''}
        onChange={(e) => onFilterChange({ ...filters, jsonrpcId: e.target.value || null })}
        style={{ width: '150px' }}
      />

      <ExportControls stats={stats} onExport={handleExport} />
    </div>
  );
}

export default RequestFilters;
