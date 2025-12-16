import { IconChevronDown } from '@tabler/icons-react';
import { colors, fonts, withOpacity } from '../../theme';
import {
  formatDateTime,
  formatRelativeTime,
  getEndpoint,
  getSourceDest,
} from '../../utils/requestUtils.js';

const ChevronDown = ({ size = 12, rotated = false }) => (
  <IconChevronDown
    size={size}
    stroke={1.5}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  />
);

export default function RequestRowMain({
  request,
  response,
  selected,
  firstRequestTime,
  onSelect,
  isExpanded,
  onToggleExpand,
  isUnpaired,
}) {
  const isSelected = selected?.frame_number === request.frame_number;
  const { source, dest } = getSourceDest(request);
  const relativeTime = formatRelativeTime(request.timestamp_iso, firstRequestTime);
  const hasResponse = !!response;

  return (
    <>
      <tr
        onClick={() => onSelect(request)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(request);
          }
        }}
        tabIndex={0}
        aria-label={`Select request ${request.frame_number}`}
        style={{
          cursor: 'pointer',
          background: isSelected
            ? colors.bgSelected
            : isUnpaired
              ? colors.bgUnpaired
              : colors.bgSecondary,
          borderBottom: `1px solid ${colors.borderLight}`,
          fontFamily: fonts.body,
          transition: 'background-color 0.15s ease',
          opacity: isUnpaired ? 0.85 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = isUnpaired
              ? withOpacity(colors.accentOrange, 0.1)
              : colors.bgCard;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = isUnpaired ? colors.bgUnpaired : colors.bgSecondary;
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'flex-end',
            }}
          >
            {hasResponse && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: colors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                <ChevronDown size={14} rotated={!isExpanded} />
              </button>
            )}
            <span
              style={{
                color: isUnpaired ? colors.accentOrange : colors.accentBlue,
                fontWeight: '500',
              }}
            >
              #{request.frame_number}
              {isUnpaired && (
                <span
                  style={{
                    fontSize: '10px',
                    color: colors.textSecondary,
                    marginLeft: '4px',
                    fontStyle: 'italic',
                  }}
                >
                  (no response)
                </span>
              )}
            </span>
          </div>
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
          {formatDateTime(request.timestamp_iso)}
        </td>
        <td
          style={{
            padding: '16px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.accentBlue,
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
            color: colors.accentBlue,
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
          {request.protocol || 'HTTP'}
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
          <div style={{ color: colors.accentBlue }}>{request.method || 'REQ'}</div>
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
          {hasResponse && (
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
          )}
        </td>
        <td
          style={{
            padding: '16px',
            color: colors.textPrimary,
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {getEndpoint(request)}
        </td>
      </tr>
    </>
  );
}
