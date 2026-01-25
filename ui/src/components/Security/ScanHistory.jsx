import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { colors, fonts } from '../../theme';
import HistoryItem from './HistoryItem.jsx';

export default function ScanHistory({
  history,
  onSelectScan,
  selectedScanId,
  expanded: alwaysExpanded,
}) {
  const [localExpanded, setLocalExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setLocalExpanded((prev) => !prev);
  }, []);

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: colors.textMuted,
          fontFamily: fonts.body,
          fontSize: '14px',
        }}
      >
        No scan history yet. Click "Analyse" to run your first scan.
      </div>
    );
  }

  const isExpanded = alwaysExpanded || localExpanded;

  // When always expanded (history view mode), show as a full list without collapsible header
  if (alwaysExpanded) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            Analysis History
          </span>
          <span
            style={{
              fontSize: '11px',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              background: colors.bgSecondary,
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {history.length} scan{history.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {history.map((scan) => (
            <HistoryItem
              key={scan.scan_id}
              scan={scan}
              onSelect={onSelectScan}
              isSelected={selectedScanId === scan.scan_id}
            />
          ))}
        </div>
      </div>
    );
  }

  // Collapsible mode (not used currently but kept for flexibility)
  return (
    <div
      style={{
        marginBottom: '16px',
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          background: colors.bgSecondary,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded ? (
            <IconChevronDown size={16} stroke={2} style={{ color: colors.textMuted }} />
          ) : (
            <IconChevronRight size={16} stroke={2} style={{ color: colors.textMuted }} />
          )}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            Scan History
          </span>
          <span
            style={{
              fontSize: '11px',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              background: colors.bgPrimary,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {history.length}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '12px',
            background: colors.bgPrimary,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {history.map((scan) => (
            <HistoryItem
              key={scan.scan_id}
              scan={scan}
              onSelect={onSelectScan}
              isSelected={selectedScanId === scan.scan_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
