import OrphanedResponseRow from './RequestRow/OrphanedResponseRow';
import RequestRowMain from './RequestRow/RequestRowMain';
import ResponseRow from './RequestRow/ResponseRow';

function RequestRow({
  pair,
  request: requestProp,
  selected,
  firstRequestTime,
  onSelect,
  isExpanded = false,
  onToggleExpand = () => {},
}) {
  // Support both pair prop (new) and request prop (legacy for grouped views)
  const extractRequestResponse = (pair, requestProp) => {
    if (pair) {
      return { request: pair.request, response: pair.response };
    }
    if (requestProp) {
      return { request: requestProp, response: null };
    }
    return null;
  };

  const data = extractRequestResponse(pair, requestProp);
  if (!data) {
    return null; // No valid data
  }

  const { request, response } = data;

  // Check if this is an unpaired request or response
  const isUnpaired = !request || !response;

  // Handle orphaned response (response without request)
  if (!request && response) {
    return (
      <OrphanedResponseRow
        response={response}
        selected={selected}
        firstRequestTime={firstRequestTime}
        onSelect={onSelect}
      />
    );
  }

  if (!request) {
    return null; // Only show rows that have a request
  }

  const hasResponse = !!response;

  return (
    <>
      <RequestRowMain
        request={request}
        response={response}
        selected={selected}
        firstRequestTime={firstRequestTime}
        onSelect={onSelect}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        isUnpaired={isUnpaired}
      />
      {hasResponse && isExpanded && (
        <ResponseRow
          response={response}
          selected={selected}
          firstRequestTime={firstRequestTime}
          onSelect={onSelect}
          request={request}
        />
      )}
    </>
  );
}

export default RequestRow;
