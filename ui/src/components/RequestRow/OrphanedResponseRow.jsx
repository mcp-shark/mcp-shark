import { colors, fonts, withOpacity } from '../../theme';
import {
  formatRelativeTime,
  formatDateTime,
  getSourceDest,
  getEndpoint,
} from '../../utils/requestUtils.js';

export default function OrphanedResponseRow({ response, selected, firstRequestTime, onSelect }) {
  const isSelected = selected?.frame_number === response.frame_number;
  const { source, dest } = getSourceDest(response);
  const relativeTime = formatRelativeTime(response.timestamp_iso, firstRequestTime);

  return (
    <tr
      onClick={() => onSelect(response)}
      style={{
        cursor: 'pointer',
        background: isSelected ? colors.bgSelected : colors.bgUnpaired,
        borderBottom: `1px solid ${colors.borderLight}`,
        fontFamily: fonts.body,
        transition: 'background-color 0.15s ease',
        opacity: 0.85,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = withOpacity(colors.accentOrange, 0.1);
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgUnpaired;
        }
      }}
    >
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          textAlign: 'right',
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        <span style={{ color: colors.accentOrange, fontWeight: '500' }}>
          #{response.frame_number} (orphaned)
        </span>
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        {relativeTime}
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontSize: '12px',
        }}
      >
        {formatDateTime(response.timestamp_iso)}
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.accentOrange,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {source}
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.accentOrange,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {dest}
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {response.protocol || 'HTTP'}
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textSecondary,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        -
      </td>
      <td
        style={{
          padding: '16px',
          borderRight: `1px solid ${colors.borderLight}`,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        <div
          style={{
            color:
              response.status_code >= 400
                ? colors.error
                : response.status_code >= 300
                  ? colors.warning
                  : colors.success,
            fontWeight: '600',
          }}
        >
          {response.status_code || '-'}
        </div>
      </td>
      <td
        style={{
          padding: '16px',
          color: colors.textPrimary,
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        {getEndpoint(response)}
      </td>
    </tr>
  );
}
