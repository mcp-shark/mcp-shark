import { useRef, useEffect } from 'react';
import { colors } from '../../theme';
import { slideInRight } from '../../utils/animations';
import RequestList from '../../PacketList';
import RequestDetail from '../../PacketDetail';
import RequestFilters from '../../PacketFilters';

export default function TrafficTab({
  requests,
  selected,
  onSelect,
  filters,
  onFilterChange,
  stats,
  firstRequestTime,
  onClear,
}) {
  const detailPanelRef = useRef(null);

  useEffect(() => {
    if (selected && detailPanelRef.current) {
      setTimeout(() => {
        if (detailPanelRef.current) {
          detailPanelRef.current.style.opacity = '0';
          detailPanelRef.current.style.transform = 'translateX(600px)';
          slideInRight(detailPanelRef.current, { width: 600 });
        }
      }, 10);
    }
  }, [selected]);

  return (
    <div data-tab-content style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <RequestFilters
          filters={filters}
          onFilterChange={onFilterChange}
          stats={stats}
          onExport={() => {}}
          onClear={onClear}
        />
        <RequestList
          requests={requests}
          selected={selected}
          onSelect={onSelect}
          firstRequestTime={firstRequestTime}
        />
      </div>
      {selected && (
        <div
          ref={detailPanelRef}
          style={{
            width: '40%',
            minWidth: '500px',
            maxWidth: '700px',
            borderLeft: `1px solid ${colors.borderLight}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: colors.bgCard,
            flexShrink: 0,
          }}
        >
          <RequestDetail request={selected} onClose={() => onSelect(null)} requests={requests} />
        </div>
      )}
    </div>
  );
}
