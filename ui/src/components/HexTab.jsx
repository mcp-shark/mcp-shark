import { useState } from 'react';
import { colors, fonts } from '../theme';

const ChevronDown = ({ size = 14, color = 'currentColor', rotated = false }) => (
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

function CollapsibleRequestResponse({ title, titleColor, children, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          background: isExpanded ? colors.bgCard : colors.bgSecondary,
          borderBottom: isExpanded ? `1px solid ${colors.borderLight}` : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isExpanded ? colors.bgCard : colors.bgSecondary;
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: titleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ChevronDown size={14} color={titleColor} rotated={!isExpanded} />
          {title}
        </div>
      </div>
      {isExpanded && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}

function HexTab({ requestHexLines, responseHexLines, hasRequest, hasResponse }) {
  return (
    <div style={{ padding: '20px', overflow: 'auto', flex: 1, background: colors.bgPrimary }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {hasRequest && (
          <CollapsibleRequestResponse
            title="Request Hex Dump"
            titleColor={colors.accentBlue}
            defaultExpanded={true}
          >
            <div
              style={{
                background: colors.bgSecondary,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderLight}`,
                maxHeight: 'calc(100vh - 300px)',
                overflow: 'auto',
              }}
            >
              {requestHexLines.length > 0 ? (
                requestHexLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '4px 0',
                      color: colors.textPrimary,
                      fontFamily: fonts.mono,
                      fontSize: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    <span style={{ color: colors.textTertiary, minWidth: '80px' }}>
                      {line.offset}
                    </span>
                    <span style={{ minWidth: '400px', color: colors.textPrimary }}>
                      {line.hex.padEnd(48)}
                    </span>
                    <span style={{ color: colors.textSecondary }}>{line.ascii}</span>
                  </div>
                ))
              ) : (
                <div
                  style={{ color: colors.textTertiary, fontFamily: fonts.body, fontSize: '12px' }}
                >
                  (empty)
                </div>
              )}
            </div>
          </CollapsibleRequestResponse>
        )}

        {hasResponse && (
          <CollapsibleRequestResponse
            title="Response Hex Dump"
            titleColor={colors.accentGreen}
            defaultExpanded={true}
          >
            <div
              style={{
                background: colors.bgSecondary,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderLight}`,
                maxHeight: 'calc(100vh - 300px)',
                overflow: 'auto',
              }}
            >
              {responseHexLines.length > 0 ? (
                responseHexLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '4px 0',
                      color: colors.textPrimary,
                      fontFamily: fonts.mono,
                      fontSize: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    <span style={{ color: colors.textTertiary, minWidth: '80px' }}>
                      {line.offset}
                    </span>
                    <span style={{ minWidth: '400px', color: colors.textPrimary }}>
                      {line.hex.padEnd(48)}
                    </span>
                    <span style={{ color: colors.textSecondary }}>{line.ascii}</span>
                  </div>
                ))
              ) : (
                <div
                  style={{ color: colors.textTertiary, fontFamily: fonts.body, fontSize: '12px' }}
                >
                  (empty)
                </div>
              )}
            </div>
          </CollapsibleRequestResponse>
        )}
      </div>
    </div>
  );
}

export default HexTab;
