import { IconSearch, IconTrash } from '@tabler/icons-react';
import anime from 'animejs';
import { useEffect, useRef, useState } from 'react';
import AlertModal from './components/AlertModal';
import ConfirmationModal from './components/ConfirmationModal';
import ExportControls from './components/PacketFilters/ExportControls';
import FilterInput from './components/PacketFilters/FilterInput';
import { colors, fonts } from './theme';
import { fadeIn } from './utils/animations';

function RequestFilters({ filters, onFilterChange, stats, onClear }) {
  const filtersRef = useRef(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (filtersRef.current) {
      fadeIn(filtersRef.current, { duration: 400 });
    }
  }, []);

  const handleExport = async (format = 'json') => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.serverName) {
        queryParams.append('serverName', filters.serverName);
      }
      if (filters.sessionId) {
        queryParams.append('sessionId', filters.sessionId);
      }
      if (filters.method) {
        queryParams.append('method', filters.method);
      }
      if (filters.jsonrpcMethod) {
        queryParams.append('jsonrpcMethod', filters.jsonrpcMethod);
      }
      if (filters.statusCode) {
        queryParams.append('statusCode', filters.statusCode);
      }
      if (filters.jsonrpcId) {
        queryParams.append('jsonrpcId', filters.jsonrpcId);
      }
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
      setAlertMessage('Failed to export traffic. Please try again.');
      setShowAlertModal(true);
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
      <div style={{ position: 'relative', width: '300px' }}>
        <IconSearch
          size={16}
          stroke={1.5}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textTertiary,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <FilterInput
          type="text"
          placeholder="Search everything (partial match)..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value || null })}
          style={{
            width: '100%',
            fontWeight: filters.search ? '500' : '400',
            paddingLeft: '36px',
          }}
        />
      </div>

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
            statusCode: e.target.value ? Number.parseInt(e.target.value) : null,
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
        type="button"
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
        <IconTrash size={14} stroke={1.5} />
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
              setAlertMessage(`Failed to clear traffic: ${error.error || 'Unknown error'}`);
              setShowAlertModal(true);
            }
          } catch (error) {
            console.error('Failed to clear traffic:', error);
            setAlertMessage('Failed to clear traffic. Please try again.');
            setShowAlertModal(true);
          }
        }}
        title="Clear All Captured Traffic"
        message="Are you sure you want to delete all captured traffic? This action cannot be undone and will permanently remove all requests and responses from the database."
        confirmText="Clear All"
        cancelText="Cancel"
        danger={true}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Error"
        message={alertMessage}
        type="error"
      />
    </div>
  );
}

export default RequestFilters;
