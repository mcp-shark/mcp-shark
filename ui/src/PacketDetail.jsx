import { useState, useEffect, useRef } from 'react';
import { colors, fonts } from './theme';
import PacketDetailHeader from './components/PacketDetailHeader';
import TabNavigation from './components/TabNavigation';
import DetailsTab from './components/DetailsTab';
import HexTab from './components/HexTab';
import RawTab from './components/RawTab';
import { generateHexDump, createFullRequestText } from './utils/hexUtils.js';
import { fadeIn } from './utils/animations';

function RequestDetail({ request, onClose, requests = [] }) {
  const [activeTab, setActiveTab] = useState('details');
  const tabContentRef = useRef(null);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    if (prevTabRef.current !== activeTab && tabContentRef.current) {
      fadeIn(tabContentRef.current, { duration: 300 });
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  if (!request) return null;

  // Find matching request/response pair
  const findMatchingPair = () => {
    if (request.direction === 'request') {
      // Find the corresponding response
      return requests.find(
        (r) =>
          r.direction === 'response' &&
          (r.session_id === request.session_id || r.jsonrpc_id === request.jsonrpc_id) &&
          r.frame_number > request.frame_number
      );
    } else {
      // Find the corresponding request
      return requests.find(
        (r) =>
          r.direction === 'request' &&
          (r.session_id === request.session_id || r.jsonrpc_id === request.jsonrpc_id) &&
          r.frame_number < request.frame_number
      );
    }
  };

  const matchingPair = findMatchingPair();
  const displayRequest = request.direction === 'request' ? request : matchingPair || request;
  const displayResponse = request.direction === 'response' ? request : matchingPair;

  const requestHeaders = displayRequest?.headers_json
    ? JSON.parse(displayRequest.headers_json)
    : {};
  const requestBody = displayRequest?.body_json
    ? JSON.parse(displayRequest.body_json)
    : displayRequest?.body_raw;
  const requestFullText = displayRequest
    ? createFullRequestText(requestHeaders, displayRequest.body_raw)
    : '';
  const requestHexLines = displayRequest ? generateHexDump(requestFullText) : [];

  const responseHeaders = displayResponse?.headers_json
    ? JSON.parse(displayResponse.headers_json)
    : {};
  const responseBody = displayResponse?.body_json
    ? JSON.parse(displayResponse.body_json)
    : displayResponse?.body_raw;
  const responseFullText = displayResponse
    ? createFullRequestText(responseHeaders, displayResponse.body_raw)
    : '';
  const responseHexLines = displayResponse ? generateHexDump(responseFullText) : [];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      <PacketDetailHeader request={request} onClose={onClose} matchingPair={matchingPair} />

      <TabNavigation
        tabs={['details', 'hex', 'raw']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        ref={tabContentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          background: colors.bgPrimary,
        }}
      >
        {activeTab === 'details' && (
          <DetailsTab
            request={displayRequest}
            response={displayResponse}
            requestHeaders={requestHeaders}
            requestBody={requestBody}
            responseHeaders={responseHeaders}
            responseBody={responseBody}
          />
        )}

        {activeTab === 'hex' && (
          <HexTab
            requestHexLines={requestHexLines}
            responseHexLines={responseHexLines}
            hasRequest={!!displayRequest}
            hasResponse={!!displayResponse}
          />
        )}

        {activeTab === 'raw' && (
          <RawTab
            requestFullText={requestFullText}
            responseFullText={responseFullText}
            hasRequest={!!displayRequest}
            hasResponse={!!displayResponse}
          />
        )}
      </div>
    </div>
  );
}

export default RequestDetail;
