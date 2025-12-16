import { getJsonRpcMethod } from './requestUtils.js';

export function pairRequestsWithResponses(requests) {
  const pairs = [];
  const processed = new Set();

  // Helper function to check if two requests match (same session, JSON-RPC method, and optionally jsonrpc_id)
  const matches = (req, resp) => {
    // Session ID must match (or both null for initiation)
    const sessionMatch = req.session_id === resp.session_id;
    if (!sessionMatch) {
      return false;
    }

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

    const methodMatch = reqMethod === respMethod;
    if (!methodMatch) {
      return false;
    }

    // If JSON-RPC ID exists, it must match (for more precise pairing)
    if (req.jsonrpc_id && resp.jsonrpc_id) {
      return req.jsonrpc_id === resp.jsonrpc_id;
    }

    // If no JSON-RPC ID, match by session and method only
    return true;
  };

  requests.forEach((request) => {
    if (processed.has(request.frame_number)) {
      return;
    }

    if (request.direction === 'request') {
      // Find matching response - must match session, endpoint, and optionally jsonrpc_id
      const response = requests.find(
        (r) =>
          r.direction === 'response' &&
          !processed.has(r.frame_number) &&
          matches(request, r) &&
          r.frame_number > request.frame_number
      );

      if (response) {
        pairs.push({ request, response, frame_number: request.frame_number });
        processed.add(request.frame_number);
        processed.add(response.frame_number);
      } else {
        // Request without response
        pairs.push({ request, response: null, frame_number: request.frame_number });
        processed.add(request.frame_number);
      }
    } else if (request.direction === 'response') {
      // Find matching request - must match session, endpoint, and optionally jsonrpc_id
      const matchingRequest = requests.find(
        (r) =>
          r.direction === 'request' &&
          !processed.has(r.frame_number) &&
          matches(r, request) &&
          r.frame_number < request.frame_number
      );

      if (!matchingRequest) {
        // Response without request (orphaned)
        pairs.push({ request: null, response: request, frame_number: request.frame_number });
        processed.add(request.frame_number);
      }
      // If matching request exists, it will be handled when we iterate over it
    }
  });

  // Sort by frame number (descending - latest first)
  return pairs.sort((a, b) => b.frame_number - a.frame_number);
}
