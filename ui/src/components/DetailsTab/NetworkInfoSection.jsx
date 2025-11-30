import { colors, fonts } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function NetworkInfoSection({ data, showUserAgent = false }) {
  return (
    <CollapsibleSection title="Network Information">
      <div
        style={{
          fontSize: '12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '4px',
        }}
      >
        Remote Address:{' '}
        <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
          {data.remote_address || 'N/A'}
        </span>
      </div>
      <div
        style={{
          fontSize: '12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '4px',
        }}
      >
        Host:{' '}
        <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
          {data.host || 'N/A'}
        </span>
      </div>
      {showUserAgent && data.user_agent && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          User Agent:{' '}
          <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{data.user_agent}</span>
        </div>
      )}
      {data.session_id && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '4px',
          }}
        >
          Session ID:{' '}
          <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
            {data.session_id}
          </span>
        </div>
      )}
    </CollapsibleSection>
  );
}
