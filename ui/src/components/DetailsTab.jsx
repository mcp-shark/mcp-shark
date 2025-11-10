import { colors, fonts } from '../theme';
import CollapsibleSection from './CollapsibleSection';

function DetailsTab({ request, headers, body }) {
  return (
    <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
      <CollapsibleSection title="Network Information">
        <div>Remote Address: {request.remote_address || 'N/A'}</div>
        <div>Host: {request.host || 'N/A'}</div>
        <div>User Agent: {request.user_agent || 'N/A'}</div>
        <div>Session ID: {request.session_id || 'N/A'}</div>
      </CollapsibleSection>

      <CollapsibleSection title={`${request.protocol || 'HTTP'} Protocol`}>
        <div>Direction: {request.direction}</div>
        {request.method && <div>Method: {request.method}</div>}
        {request.url && <div>URL: {request.url}</div>}
        {request.status_code && <div>Status Code: {request.status_code}</div>}
        {request.jsonrpc_method && <div>JSON-RPC Method: {request.jsonrpc_method}</div>}
        {request.jsonrpc_id && <div>JSON-RPC ID: {request.jsonrpc_id}</div>}
      </CollapsibleSection>

      <CollapsibleSection title="Headers">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '2px' }}>
            <span style={{ color: colors.accentBlue, fontWeight: '500' }}>{key}:</span>{' '}
            <span style={{ color: colors.textPrimary }}>{String(value)}</span>
          </div>
        ))}
      </CollapsibleSection>

      {body && (
        <CollapsibleSection title="Body" titleColor="#4ec9b0">
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: fonts.mono,
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
            }}
          >
            {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
          </pre>
        </CollapsibleSection>
      )}

      {request.jsonrpc_result && (
        <CollapsibleSection title="JSON-RPC Result" titleColor="#4ec9b0">
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: fonts.mono,
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
            }}
          >
            {JSON.stringify(JSON.parse(request.jsonrpc_result), null, 2)}
          </pre>
        </CollapsibleSection>
      )}

      {request.jsonrpc_error && (
        <CollapsibleSection title="JSON-RPC Error" titleColor={colors.error}>
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: fonts.mono,
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
            }}
          >
            {JSON.stringify(JSON.parse(request.jsonrpc_error), null, 2)}
          </pre>
        </CollapsibleSection>
      )}
    </div>
  );
}

export default DetailsTab;
