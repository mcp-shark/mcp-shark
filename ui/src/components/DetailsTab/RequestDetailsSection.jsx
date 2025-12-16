import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';
import BodySection from './BodySection';
import CollapsibleRequestResponse from './CollapsibleRequestResponse';
import HeadersSection from './HeadersSection';
import InfoSection from './InfoSection';
import NetworkInfoSection from './NetworkInfoSection';
import ProtocolInfoSection from './ProtocolInfoSection';

export default function RequestDetailsSection({ request, requestHeaders, requestBody }) {
  if (!request) {
    return null;
  }

  return (
    <CollapsibleRequestResponse
      title="Request"
      titleColor={colors.accentBlue}
      defaultExpanded={true}
    >
      <InfoSection data={request} titleColor={colors.accentBlue} />
      <NetworkInfoSection data={request} showUserAgent={true} />
      <ProtocolInfoSection data={request} titleColor={colors.accentBlue} />
      <HeadersSection headers={requestHeaders} titleColor={colors.accentBlue} />
      <BodySection body={requestBody} titleColor={colors.accentBlue} />
      {request.jsonrpc_params && (
        <CollapsibleSection title="JSON-RPC Params" titleColor={colors.accentBlue}>
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
              lineHeight: '1.5',
            }}
          >
            {JSON.stringify(JSON.parse(request.jsonrpc_params), null, 2)}
          </pre>
        </CollapsibleSection>
      )}
    </CollapsibleRequestResponse>
  );
}
