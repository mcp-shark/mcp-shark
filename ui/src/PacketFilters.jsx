import { useEffect, useRef, useState } from 'react';
import { colors, fonts } from './theme';
import { fadeIn } from './utils/animations';
import FilterInput from './components/PacketFilters/FilterInput';
import ExportControls from './components/PacketFilters/ExportControls';
import ConfirmationModal from './components/ConfirmationModal';
import anime from 'animejs';

function RequestFilters({ filters, onFilterChange, stats, onExport, onClear }) {
  const filtersRef = useRef(null);
  const [showClearModal, setShowClearModal] = useState(false);

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
        background: colors.bgSecondary,
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

      <button
        onClick={() => setShowClearModal(true)}
        style={{
          padding: '8px 14px',
          background: colors.buttonDanger,
          border: 'none',
          color: colors.textInverse,
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
          marginLeft: '12px',
        }}
        onMouseEnter={(e) => {
          anime({
            targets: e.currentTarget,
            background: colors.buttonDangerHover,
            translateY: -1,
            boxShadow: [`0 2px 4px ${colors.shadowSm}`, `0 4px 8px ${colors.shadowMd}`],
            duration: 200,
            easing: 'easeOutQuad',
          });
        }}
        onMouseLeave={(e) => {
          anime({
            targets: e.currentTarget,
            background: colors.buttonDanger,
            translateY: 0,
            boxShadow: [`0 4px 8px ${colors.shadowMd}`, `0 2px 4px ${colors.shadowSm}`],
            duration: 200,
            easing: 'easeOutQuad',
          });
        }}
        title="Clear all captured traffic"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Clear
      </button>

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={async () => {
          try {
            const response = await fetch('/api/requests/clear', {
              method: 'POST',
            });
            if (response.ok) {
              if (onClear) {
                onClear();
              }
            } else {
              const error = await response.json();
              alert(`Failed to clear traffic: ${error.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Failed to clear traffic:', error);
            alert('Failed to clear traffic. Please try again.');
          }
        }}
        title="Clear All Captured Traffic"
        message="Are you sure you want to delete all captured traffic? This action cannot be undone and will permanently remove all requests and responses from the database."
        confirmText="Clear All"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
}

export default RequestFilters;
