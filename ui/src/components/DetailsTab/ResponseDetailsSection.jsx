import { colors, fonts } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';
import BodySection from './BodySection';
import CollapsibleRequestResponse from './CollapsibleRequestResponse';
import HeadersSection from './HeadersSection';
import InfoSection from './InfoSection';
import NetworkInfoSection from './NetworkInfoSection';
import ProtocolInfoSection from './ProtocolInfoSection';

export default function ResponseDetailsSection({ response, responseHeaders, responseBody }) {
  if (!response) {
    return null;
  }

  return (
    <CollapsibleRequestResponse
      title="Response"
      titleColor={colors.accentGreen}
      defaultExpanded={true}
    >
      <InfoSection data={response} titleColor={colors.accentGreen} />
      <NetworkInfoSection data={response} />
      <ProtocolInfoSection data={response} titleColor={colors.accentGreen} />
      <HeadersSection headers={responseHeaders} titleColor={colors.accentGreen} />
      <BodySection body={responseBody} titleColor={colors.accentGreen} />
      {response.jsonrpc_result && (
        <CollapsibleSection title="JSON-RPC Result" titleColor={colors.accentGreen}>
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: fonts.mono,
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.textPrimary,
              lineHeight: '1.5',
            }}
          >
            {JSON.stringify(JSON.parse(response.jsonrpc_result), null, 2)}
          </pre>
        </CollapsibleSection>
      )}
      {response.jsonrpc_error && (
        <CollapsibleSection title="JSON-RPC Error" titleColor={colors.error}>
          <pre
            style={{
              background: colors.bgSecondary,
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: fonts.mono,
              maxHeight: '400px',
              border: `1px solid ${colors.borderLight}`,
              color: colors.error,
              lineHeight: '1.5',
            }}
          >
            {JSON.stringify(JSON.parse(response.jsonrpc_error), null, 2)}
          </pre>
        </CollapsibleSection>
      )}
    </CollapsibleRequestResponse>
  );
}
