import { colors, fonts, withOpacity } from '../theme';
import {
  formatRelativeTime,
  formatDateTime,
  getSourceDest,
  getEndpoint,
  getInfo,
  getRequestColor,
} from '../utils/requestUtils.js';

const ChevronDown = ({ size = 12, color = 'currentColor', rotated = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function RequestRow({
  pair,
  request: requestProp,
  selected,
  firstRequestTime,
  onSelect,
  isExpanded = false,
  onToggleExpand = () => {},
}) {
  // Support both pair prop (new) and request prop (legacy for grouped views)
  let request, response;
  if (pair) {
    request = pair.request;
    response = pair.response;
  } else if (requestProp) {
    request = requestProp;
    response = null;
  } else {
    return null; // No valid data
  }

  // Check if this is an unpaired request or response
  const isUnpaired = !request || !response;

  // Handle orphaned response (response without request)
  if (!request && response) {
    const isSelected = selected?.frame_number === response.frame_number;
    const { source, dest } = getSourceDest(response);
    const relativeTime = formatRelativeTime(response.timestamp_iso, firstRequestTime);

    return (
      <tr
        onClick={() => onSelect(response)}
        style={{
          cursor: 'pointer',
          background: isSelected ? colors.bgSelected : colors.bgUnpaired, // Different color for unpaired
          borderBottom: `1px solid ${colors.borderLight}`,
          fontFamily: fonts.body,
          transition: 'background-color 0.15s ease',
          opacity: 0.85, // Slightly faded to indicate unpaired
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
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {getEndpoint(response)}
        </td>
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
          {response.length}
        </td>
        <td
          style={{
            padding: '16px',
            color: colors.accentOrange,
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          {getInfo(response)}
        </td>
      </tr>
    );
  }

  if (!request) return null; // Only show rows that have a request

  const isSelected = selected?.frame_number === request.frame_number;
  const { source, dest } = getSourceDest(request);
  const relativeTime = formatRelativeTime(request.timestamp_iso, firstRequestTime);
  const hasResponse = !!response;

  return (
    <>
      {/* Request Row */}
      <tr
        onClick={() => onSelect(request)}
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
          opacity: isUnpaired ? 0.85 : 1, // Slightly faded for unpaired
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
            color: request ? colors.accentBlue : colors.textSecondary,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {request.method || '-'}
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
          <div>
            <div style={{ color: colors.accentBlue, marginBottom: hasResponse ? '4px' : '0' }}>
              {request.method || 'REQ'}
            </div>
            {hasResponse && (
              <div
                style={{
                  color:
                    response.status_code >= 400
                      ? colors.error
                      : response.status_code >= 300
                        ? colors.warning
                        : colors.success,
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                {response.status_code || 'RESP'}
              </div>
            )}
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
          {getEndpoint(request)}
        </td>
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
          {request.length}
        </td>
        <td
          style={{
            padding: '16px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          <div style={{ color: colors.accentBlue, fontSize: '12px' }}>{getInfo(request)}</div>
        </td>
      </tr>

      {/* Response Row (Collapsible) */}
      {hasResponse && isExpanded && (
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
            {formatRelativeTime(response.timestamp_iso, firstRequestTime)}
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
            {getSourceDest(response).source}
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
            {getSourceDest(response).dest}
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
              borderRight: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
              fontFamily: fonts.mono,
              fontSize: '12px',
            }}
          >
            {getEndpoint(response)}
          </td>
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
            {response.length}
          </td>
          <td
            style={{
              padding: '16px',
              color: colors.accentGreen,
              fontFamily: fonts.body,
              fontSize: '12px',
            }}
          >
            {getInfo(response)}
          </td>
        </tr>
      )}
    </>
  );
}

export default RequestRow;
