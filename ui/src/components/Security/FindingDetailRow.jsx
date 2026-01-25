import { useEffect, useState } from 'react';
import { colors, fonts } from '../../theme';

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: '600',
        color: colors.textSecondary,
        fontFamily: fonts.body,
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}
    >
      {children}
    </div>
  );
}

function PacketDetails({ packet }) {
  const headers = packet.headers_json ? JSON.parse(packet.headers_json) : null;
  const body = packet.body_json ? JSON.parse(packet.body_json) : packet.body_raw;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* Headers */}
      {headers && Object.keys(headers).length > 0 && (
        <div>
          <SectionLabel>Request Headers</SectionLabel>
          <div
            style={{
              background: colors.bgSecondary,
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              fontFamily: fonts.mono,
            }}
          >
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '4px' }}>
                <span style={{ color: colors.accentBlue }}>{key}:</span>{' '}
                <span style={{ color: colors.textPrimary }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      {body && (
        <div>
          <SectionLabel>Request Body</SectionLabel>
          <pre
            style={{
              background: colors.bgSecondary,
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              fontFamily: fonts.mono,
              color: colors.textPrimary,
              margin: 0,
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
          </pre>
        </div>
      )}
    </div>
  );
}

function FindingDetailRow({ finding, colSpan }) {
  const [packet, setPacket] = useState(null);
  const [loadingPacket, setLoadingPacket] = useState(false);

  useEffect(() => {
    if (finding.frame_number) {
      setLoadingPacket(true);
      fetch(`/api/packets/${finding.frame_number}`)
        .then((res) => res.json())
        .then((data) => {
          setPacket(data);
          setLoadingPacket(false);
        })
        .catch(() => {
          setLoadingPacket(false);
        });
    }
  }, [finding.frame_number]);

  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          padding: '16px 20px',
          background: `${colors.accent}08`,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Description */}
          <div>
            <SectionLabel>Description</SectionLabel>
            <p
              style={{
                fontSize: '13px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {finding.description}
            </p>
          </div>

          {/* Evidence */}
          {finding.evidence && (
            <div>
              <SectionLabel>Evidence</SectionLabel>
              <code
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  background: colors.bgSecondary,
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: fonts.mono,
                  color: colors.textPrimary,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {finding.evidence}
              </code>
            </div>
          )}

          {/* Packet Details */}
          {finding.frame_number && (
            <div>
              <SectionLabel>Captured Packet (Frame #{finding.frame_number})</SectionLabel>
              {loadingPacket && (
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Loading packet data...
                </div>
              )}
              {packet && <PacketDetails packet={packet} />}
              {!loadingPacket && !packet && (
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Packet data not available
                </div>
              )}
            </div>
          )}

          {/* Recommendation */}
          {finding.recommendation && (
            <div>
              <SectionLabel>Recommendation</SectionLabel>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.success,
                  fontFamily: fonts.body,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {finding.recommendation}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px' }}>
            <div>
              <span style={{ color: colors.textSecondary }}>Rule: </span>
              <span style={{ fontFamily: fonts.mono, color: colors.textPrimary }}>
                {finding.rule_id}
              </span>
            </div>
            {finding.session_id && (
              <div>
                <span style={{ color: colors.textSecondary }}>Session: </span>
                <span style={{ fontFamily: fonts.mono, color: colors.textPrimary }}>
                  {finding.session_id}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default FindingDetailRow;
