import { CheckIcon, ShieldIcon, LoadingSpinner } from '../SmartScanIcons';
import { colors, fonts } from '../../theme';

export default function ServerSelectionRow({
  discoveredServers,
  selectedServers,
  setSelectedServers,
  runScan,
  scanning,
  apiToken,
}) {
  const toggleSelectAll = () => {
    if (selectedServers.size === discoveredServers.length) {
      setSelectedServers(new Set());
    } else {
      setSelectedServers(new Set(discoveredServers.map((s) => s.name)));
    }
  };

  return (
    <div
      style={{
        background: colors.bgSecondary,
        borderBottom: `1px solid ${colors.borderLight}`,
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            whiteSpace: 'nowrap',
          }}
        >
          Select servers to scan:
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            flex: 1,
          }}
        >
          {discoveredServers.map((server, idx) => {
            const isSelected = selectedServers.has(server.name);
            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: isSelected ? colors.bgCard : colors.bgTertiary,
                  border: `1px solid ${isSelected ? colors.accentBlue : colors.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '12px',
                  fontFamily: fonts.body,
                  fontWeight: isSelected ? '600' : '500',
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accentBlue;
                  e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadowSm}`;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.borderLight;
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    const newSelected = new Set(selectedServers);
                    if (e.target.checked) {
                      newSelected.add(server.name);
                    } else {
                      newSelected.delete(server.name);
                    }
                    setSelectedServers(newSelected);
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: colors.accentBlue,
                  }}
                />
                <span>{server.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: colors.textTertiary,
                    fontWeight: '400',
                  }}
                >
                  ({server.tools?.length || 0} tools, {server.resources?.length || 0} resources,{' '}
                  {server.prompts?.length || 0} prompts)
                </span>
              </label>
            );
          })}
        </div>
        <button
          onClick={toggleSelectAll}
          style={{
            padding: '6px 12px',
            background: colors.buttonSecondary,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderMedium}`,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            fontFamily: fonts.body,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonSecondaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.buttonSecondary;
          }}
        >
          {selectedServers.size === discoveredServers.length ? 'Deselect All' : 'Select All'}
        </button>
        <button
          onClick={runScan}
          disabled={!apiToken || selectedServers.size === 0 || scanning}
          style={{
            padding: '8px 16px',
            background:
              apiToken && selectedServers.size > 0 && !scanning
                ? colors.buttonPrimary
                : colors.buttonSecondary,
            color:
              apiToken && selectedServers.size > 0 && !scanning
                ? colors.textInverse
                : colors.textTertiary,
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: fonts.body,
            cursor: apiToken && selectedServers.size > 0 && !scanning ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (apiToken && selectedServers.size > 0 && !scanning) {
              e.currentTarget.style.background = colors.buttonPrimaryHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
            }
          }}
          onMouseLeave={(e) => {
            if (apiToken && selectedServers.size > 0 && !scanning) {
              e.currentTarget.style.background = colors.buttonPrimary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {scanning ? (
            <>
              <LoadingSpinner size={14} color={colors.textInverse} />
              <span>
                Scanning {selectedServers.size} server{selectedServers.size !== 1 ? 's' : ''}...
              </span>
            </>
          ) : (
            <>
              <ShieldIcon
                size={14}
                color={
                  apiToken && selectedServers.size > 0 ? colors.textInverse : colors.textTertiary
                }
              />
              <span>Run Scan ({selectedServers.size})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
