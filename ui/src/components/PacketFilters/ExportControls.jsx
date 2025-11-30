import { colors, fonts } from '../../theme';
import { IconDownload } from '@tabler/icons-react';
import anime from 'animejs';

export default function ExportControls({ stats, onExport }) {
  return (
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
          onClick={() => onExport('json')}
          style={{
            padding: '8px 14px',
            background: colors.buttonPrimary,
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
          }}
          onMouseEnter={(e) => {
            anime({
              targets: e.currentTarget,
              background: colors.buttonPrimaryHover,
              translateY: -1,
              boxShadow: [`0 2px 4px ${colors.shadowSm}`, `0 4px 8px ${colors.shadowMd}`],
              duration: 200,
              easing: 'easeOutQuad',
            });
          }}
          onMouseLeave={(e) => {
            anime({
              targets: e.currentTarget,
              background: colors.buttonPrimary,
              translateY: 0,
              boxShadow: [`0 4px 8px ${colors.shadowMd}`, `0 2px 4px ${colors.shadowSm}`],
              duration: 200,
              easing: 'easeOutQuad',
            });
          }}
          title="Export as JSON"
        >
          <IconDownload size={14} stroke={1.5} />
          Export
        </button>
        <select
          onChange={(e) => onExport(e.target.value)}
          value=""
          style={{
            padding: '8px 10px',
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontSize: '11px',
            fontFamily: fonts.body,
            borderRadius: '8px',
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
  );
}
