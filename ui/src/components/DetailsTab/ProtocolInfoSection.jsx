import { colors, fonts } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function ProtocolInfoSection({ data, titleColor }) {
  return (
    <CollapsibleSection title={`${data.protocol || 'HTTP'} Protocol`}>
      <div
        style={{
          fontSize: '12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '4px',
        }}
      >
        Direction: <span style={{ color: titleColor, fontWeight: '500' }}>{data.direction}</span>
      </div>
      {data.status_code && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          Status Code:{' '}
          <span
            style={{
              color:
                data.status_code >= 400
                  ? colors.error
                  : data.status_code >= 300
                    ? colors.warning
                    : colors.success,
              fontFamily: fonts.mono,
              fontWeight: '600',
            }}
          >
            {data.status_code}
          </span>
        </div>
      )}
      {data.jsonrpc_method && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          JSON-RPC Method:{' '}
          <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
            {data.jsonrpc_method}
          </span>
        </div>
      )}
      {data.jsonrpc_id && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          JSON-RPC ID:{' '}
          <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
            {data.jsonrpc_id}
          </span>
        </div>
      )}
    </CollapsibleSection>
  );
}
