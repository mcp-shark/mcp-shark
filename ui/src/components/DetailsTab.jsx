import { colors } from '../theme';
import RequestDetailsSection from './DetailsTab/RequestDetailsSection';
import ResponseDetailsSection from './DetailsTab/ResponseDetailsSection';

function DetailsTab({
  request,
  response,
  requestHeaders,
  requestBody,
  responseHeaders,
  responseBody,
}) {
  return (
    <div style={{ padding: '20px', overflow: 'auto', flex: 1, background: colors.bgPrimary }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <RequestDetailsSection
          request={request}
          requestHeaders={requestHeaders}
          requestBody={requestBody}
        />
        <ResponseDetailsSection
          response={response}
          responseHeaders={responseHeaders}
          responseBody={responseBody}
        />
      </div>
    </div>
  );
}

export default DetailsTab;
