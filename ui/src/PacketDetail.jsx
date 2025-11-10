import { useState } from 'react';
import { colors } from './theme';
import PacketDetailHeader from './components/PacketDetailHeader';
import TabNavigation from './components/TabNavigation';
import DetailsTab from './components/DetailsTab';
import HexTab from './components/HexTab';
import RawTab from './components/RawTab';
import { generateHexDump, createFullRequestText } from './utils/hexUtils.js';

function RequestDetail({ request, onClose }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!request) return null;

  const headers = request.headers_json ? JSON.parse(request.headers_json) : {};
  const body = request.body_json ? JSON.parse(request.body_json) : request.body_raw;
  const fullRequestText = createFullRequestText(headers, request.body_raw);
  const hexLines = generateHexDump(fullRequestText);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      <PacketDetailHeader request={request} onClose={onClose} />

      <TabNavigation
        tabs={['details', 'hex', 'raw']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: colors.bgPrimary,
        }}
      >
        {activeTab === 'details' && <DetailsTab request={request} headers={headers} body={body} />}

        {activeTab === 'hex' && <HexTab hexLines={hexLines} />}

        {activeTab === 'raw' && <RawTab fullRequestText={fullRequestText} />}
      </div>
    </div>
  );
}

export default RequestDetail;
