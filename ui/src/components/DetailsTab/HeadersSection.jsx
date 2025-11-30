import { colors, fonts } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function HeadersSection({ headers, titleColor }) {
  if (!headers || Object.keys(headers).length === 0) return null;

  return (
    <CollapsibleSection title="Headers">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '6px', fontSize: '12px', fontFamily: fonts.body }}>
          <span
            style={{
              color: titleColor,
              fontWeight: '500',
              fontFamily: fonts.mono,
            }}
          >
            {key}:
          </span>{' '}
          <span style={{ color: colors.textPrimary }}>{String(value)}</span>
        </div>
      ))}
    </CollapsibleSection>
  );
}
