import { colors, fonts } from '../theme';
import { IconTrash, IconDownload, IconSearch } from '@tabler/icons-react';

export default function LogsToolbar({
  filter,
  setFilter,
  logType,
  setLogType,
  autoScroll,
  setAutoScroll,
  onClearLogs,
  onExportLogs,
  filteredCount,
  totalCount,
}) {
  return (
    <div
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
          }}
        />
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px 8px 36px',
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontSize: '13px',
            fontFamily: fonts.body,
            width: '100%',
            borderRadius: '8px',
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
      </div>

      <select
        value={logType}
        onChange={(e) => setLogType(e.target.value)}
        style={{
          padding: '8px 12px',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.body,
          borderRadius: '8px',
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
        <option value="all">All Types</option>
        <option value="stdout">Stdout</option>
        <option value="stderr">Stderr</option>
        <option value="error">Errors</option>
        <option value="exit">Exit</option>
      </select>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: colors.textPrimary,
          fontSize: '13px',
          fontFamily: fonts.body,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={autoScroll}
          onChange={(e) => setAutoScroll(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        Auto-scroll
      </label>

      <button
        onClick={onClearLogs}
        style={{
          padding: '8px 14px',
          background: colors.buttonDanger,
          border: 'none',
          color: colors.textInverse,
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'all 0.2s',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.buttonDangerHover;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.buttonDanger;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <IconTrash size={14} stroke={1.5} />
        Clear Logs
      </button>

      <button
        onClick={onExportLogs}
        style={{
          padding: '8px 14px',
          background: colors.buttonPrimary,
          border: 'none',
          color: colors.textInverse,
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'all 0.2s',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.buttonPrimaryHover;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.buttonPrimary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <IconDownload size={14} stroke={1.5} />
        Export Logs
      </button>

      <div
        style={{
          marginLeft: 'auto',
          color: colors.textSecondary,
          fontSize: '12px',
          fontFamily: fonts.body,
        }}
      >
        {filteredCount} / {totalCount} lines
      </div>
    </div>
  );
}
