import { colors, fonts } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function BodySection({ body, title, titleColor }) {
  if (!body) return null;

  return (
    <CollapsibleSection title={title || 'Body'} titleColor={titleColor}>
      <pre
        style={{
          background: colors.bgSecondary,
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: fonts.mono,
          maxHeight: '400px',
          border: `1px solid ${colors.borderLight}`,
          color: colors.textPrimary,
          lineHeight: '1.5',
        }}
      >
        {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
      </pre>
    </CollapsibleSection>
  );
}
