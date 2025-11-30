import { useState, useEffect, useMemo, useRef } from 'react';
import { colors, fonts } from './theme';
import RequestRow from './components/RequestRow';
import TableHeader from './components/TableHeader';
import ViewModeTabs from './components/ViewModeTabs';
import GroupedByMcpView from './components/GroupedByMcpView';
import { groupByMcpSessionAndCategory } from './utils/mcpGroupingUtils.js';
import { pairRequestsWithResponses } from './utils/requestUtils.js';
import { staggerIn } from './utils/animations';
import anime from 'animejs';

function RequestList({ requests, selected, onSelect, firstRequestTime }) {
  const [viewMode, setViewMode] = useState('general');
  const [columnWidths] = useState({
    frame: 60,
    time: 120,
    datetime: 180,
    source: 120,
    destination: 120,
    protocol: 80,
    method: 80,
    status: 80,
    endpoint: 250,
    length: 80,
    info: 400,
  });
  const [expandedResponses, setExpandedResponses] = useState(new Set());
  const [expandedMcpSessions, setExpandedMcpSessions] = useState(new Set());
  const [expandedMcpCategories, setExpandedMcpCategories] = useState(new Set());
  const tbodyRef = useRef(null);
  const prevRequestsLengthRef = useRef(0);

  const groupedByMcp = useMemo(() => groupByMcpSessionAndCategory(requests), [requests]);

  // Animate rows when requests change
  useEffect(() => {
    if (tbodyRef.current && requests.length > 0) {
      const rows = tbodyRef.current.querySelectorAll('tr');
      if (rows.length > 0) {
        // Only animate new rows if the list has grown
        if (requests.length > prevRequestsLengthRef.current) {
          const newRows = Array.from(rows).slice(prevRequestsLengthRef.current);
          if (newRows.length > 0) {
            staggerIn(newRows, { delay: 30, duration: 300 });
          }
        } else {
          // Animate all rows if the list was reset
          staggerIn(rows, { delay: 20, duration: 300 });
        }
        prevRequestsLengthRef.current = requests.length;
      }
    }
  }, [requests]);

  useEffect(() => {
    if (viewMode === 'groupedByMcp') {
      // Auto-expand all MCP sessions and categories
      const allSessionIds = new Set(groupedByMcp.map((g) => g.sessionId || '__NO_SESSION__'));
      setExpandedMcpSessions((prev) => {
        const updated = new Set(prev);
        allSessionIds.forEach((id) => updated.add(id));
        return updated;
      });

      setExpandedMcpCategories((prev) => {
        const updated = new Set(prev);
        groupedByMcp.forEach((sessionGroup) => {
          const sessionKey = sessionGroup.sessionId || '__NO_SESSION__';
          sessionGroup.categories.forEach((category) => {
            updated.add(`${sessionKey}::${category.category}`);
          });
        });
        return updated;
      });
    }
  }, [groupedByMcp, viewMode]);

  const toggleMcpSession = (sessionKey) => {
    setExpandedMcpSessions((prev) => {
      const updated = new Set(prev);
      if (updated.has(sessionKey)) {
        updated.delete(sessionKey);
      } else {
        updated.add(sessionKey);
      }
      return updated;
    });
  };

  const toggleMcpCategory = (categoryKey) => {
    setExpandedMcpCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(categoryKey)) {
        updated.delete(categoryKey);
      } else {
        updated.add(categoryKey);
      }
      return updated;
    });
  };

  const pairedRequests = useMemo(() => pairRequestsWithResponses(requests), [requests]);

  const toggleResponse = (frameNumber) => {
    setExpandedResponses((prev) => {
      const updated = new Set(prev);
      if (updated.has(frameNumber)) {
        updated.delete(frameNumber);
      } else {
        updated.add(frameNumber);
      }
      return updated;
    });
  };

  const renderGeneralView = () => (
    <tbody ref={tbodyRef}>
      {pairedRequests.map((pair) => (
        <RequestRow
          key={pair.frame_number}
          pair={pair}
          selected={selected}
          firstRequestTime={firstRequestTime}
          onSelect={onSelect}
          isExpanded={expandedResponses.has(pair.frame_number)}
          onToggleExpand={() => toggleResponse(pair.frame_number)}
        />
      ))}
    </tbody>
  );

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '12px',
            fontFamily: fonts.body,
            background: colors.bgPrimary,
          }}
        >
          <TableHeader columnWidths={columnWidths} />
          {viewMode === 'general' ? (
            renderGeneralView()
          ) : (
            <GroupedByMcpView
              groupedData={groupedByMcp}
              expandedSessions={expandedMcpSessions}
              expandedCategories={expandedMcpCategories}
              onToggleSession={toggleMcpSession}
              onToggleCategory={toggleMcpCategory}
              selected={selected}
              firstRequestTime={firstRequestTime}
              onSelect={onSelect}
            />
          )}
        </table>
      </div>
    </div>
  );
}

export default RequestList;
