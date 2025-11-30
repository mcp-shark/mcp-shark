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

  // Helper function to extract JSON-RPC method
  const getJsonRpcMethod = (req) => {
    // First check the jsonrpc_method field (most reliable)
    if (req.jsonrpc_method) {
      return req.jsonrpc_method;
    }

    // For requests, try to extract from body
    if (req.direction === 'request') {
      if (req.body_json) {
        try {
          const body =
            typeof req.body_json === 'string' ? JSON.parse(req.body_json) : req.body_json;
          if (body && typeof body === 'object' && body.method) {
            return body.method;
          }
        } catch (e) {
          // Failed to parse
        }
      }
      if (req.body_raw) {
        try {
          const body = typeof req.body_raw === 'string' ? JSON.parse(req.body_raw) : req.body_raw;
          if (body && typeof body === 'object' && body.method) {
            return body.method;
          }
        } catch (e) {
          // Failed to parse
        }
      }
    }

    return null;
  };

  // Find matching request/response pair
  const findMatchingPair = () => {
    const matches = (req, resp) => {
      // Session ID must match
      if (req.session_id !== resp.session_id) return false;

      // JSON-RPC Method must match
      const reqMethod = getJsonRpcMethod(req);
      const respMethod = getJsonRpcMethod(resp);

      // Both must have a method, and they must match
      if (!reqMethod || !respMethod) {
        // If either doesn't have a method, we can't match by method
        // Fall back to JSON-RPC ID matching only
        if (req.jsonrpc_id && resp.jsonrpc_id) {
          return req.jsonrpc_id === resp.jsonrpc_id;
        }
        // If no method and no ID, we can't match reliably
        return false;
      }

      if (reqMethod !== respMethod) return false;

      // If JSON-RPC ID exists, it must match
      if (req.jsonrpc_id && resp.jsonrpc_id) {
        return req.jsonrpc_id === resp.jsonrpc_id;
      }

      return true;
    };

    if (request.direction === 'request') {
      // Find the corresponding response
      return requests.find(
        (r) =>
          r.direction === 'response' && matches(request, r) && r.frame_number > request.frame_number
      );
    } else {
      // Find the corresponding request
      return requests.find(
        (r) =>
          r.direction === 'request' && matches(r, request) && r.frame_number < request.frame_number
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
