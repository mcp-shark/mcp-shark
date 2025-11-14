import { colors, fonts } from '../theme';
import {
  formatRelativeTime,
  formatDateTime,
  getSourceDest,
  getEndpoint,
  getInfo,
  getRequestColor,
} from '../utils/requestUtils.js';
import anime from 'animejs';

function RequestRow({ request, selected, firstRequestTime, onSelect }) {
  const isSelected = selected?.frame_number === request.frame_number;
  const color = getRequestColor(request);
  const { source, dest } = getSourceDest(request);
  const relativeTime = formatRelativeTime(request.timestamp_iso, firstRequestTime);

  return (
    <tr
      onClick={() => onSelect(request)}
      style={{
        cursor: 'pointer',
        background: isSelected ? `${colors.accentBlue}20` : color,
        borderBottom: `1px solid ${colors.borderLight}`,
        fontFamily: fonts.body,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          anime({
            targets: e.currentTarget,
            background: `${colors.accentBlue}15`,
            scale: [1, 1.01],
            duration: 200,
            easing: 'easeOutQuad',
          });
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          anime({
            targets: e.currentTarget,
            background: color,
            scale: [1.01, 1],
            duration: 200,
            easing: 'easeOutQuad',
          });
        }
      }}
    >
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          textAlign: 'right',
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        {request.frame_number}
      </td>
      <td
        style={{
          padding: '8px 12px',
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
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontSize: '12px',
        }}
      >
        {formatDateTime(request.timestamp_iso)}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: request.direction === 'request' ? colors.accentBlue : colors.accentGreen,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {source}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: request.direction === 'request' ? colors.accentBlue : colors.accentGreen,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {dest}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {request.protocol || 'HTTP'}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: request.direction === 'request' ? colors.accentBlue : colors.textSecondary,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {request.direction === 'request' ? request.method || '-' : '-'}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color:
            request.direction === 'response'
              ? request.status_code >= 400
                ? colors.error
                : request.status_code >= 300
                  ? colors.warning
                  : colors.success
              : colors.textSecondary,
          fontFamily: fonts.mono,
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {request.direction === 'response' ? request.status_code || '-' : '-'}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        {getEndpoint(request)}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderRight: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          textAlign: 'right',
          fontFamily: fonts.mono,
          fontSize: '12px',
        }}
      >
        {request.length}
      </td>
      <td
        style={{
          padding: '8px 12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontSize: '12px',
        }}
      >
        {getInfo(request)}
      </td>
    </tr>
  );
}

export default RequestRow;
