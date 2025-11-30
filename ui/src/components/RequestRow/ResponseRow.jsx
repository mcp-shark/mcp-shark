import { colors, fonts } from '../../theme';
import {
  formatRelativeTime,
  formatDateTime,
  getSourceDest,
  getEndpoint,
} from '../../utils/requestUtils.js';

export default function ResponseRow({ response, selected, firstRequestTime, onSelect, request }) {
  const isSelected = selected?.frame_number === response.frame_number;
  const { source, dest } = getSourceDest(response);
  const relativeTime = formatRelativeTime(response.timestamp_iso, firstRequestTime);

  return (
    <tr
      onClick={() => onSelect(response)}
      style={{
        cursor: 'pointer',
        background:
          isSelected && selected?.frame_number === response.frame_number
            ? colors.bgSelected
            : colors.bgTertiary,
        borderBottom: `1px solid ${colors.borderLight}`,
        fontFamily: fonts.body,
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!(isSelected && selected?.frame_number === response.frame_number)) {
          e.currentTarget.style.background = colors.bgSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!(isSelected && selected?.frame_number === response.frame_number)) {
          e.currentTarget.style.background = colors.bgTertiary;
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
          paddingLeft: '40px',
        }}
      >
        <span style={{ color: colors.accentGreen, fontWeight: '500' }}>
          #{response.frame_number}
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
          color: colors.accentGreen,
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
          color: colors.accentGreen,
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
