import { colors, fonts } from '../../theme';
import { getInfo } from '../../utils/requestUtils';
import CollapsibleSection from '../CollapsibleSection';

export default function InfoSection({ data, titleColor }) {
  if (!data) {
    return null;
  }

  const info = getInfo(data);

  return (
    <CollapsibleSection title="Info" titleColor={titleColor} defaultExpanded={false}>
      <div
        style={{
          background: colors.bgSecondary,
          padding: '12px 16px',
          borderRadius: '6px',
          border: `1px solid ${colors.borderLight}`,
          fontFamily: fonts.mono,
          fontSize: '12px',
          color: titleColor,
          wordBreak: 'break-word',
        }}
      >
        {info}
      </div>
    </CollapsibleSection>
  );
}
