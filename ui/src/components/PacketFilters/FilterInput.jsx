import { colors, fonts } from '../../theme';
import anime from 'animejs';

export default function FilterInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  style = {},
  ...props
}) {
  const defaultStyle = {
    padding: '8px 12px',
    background: colors.bgCard,
    border: `1px solid ${colors.borderLight}`,
    color: colors.textPrimary,
    fontSize: '13px',
    fontFamily:
      type === 'number' || placeholder?.includes('JSON-RPC') || placeholder?.includes('HTTP')
        ? fonts.mono
        : fonts.body,
    borderRadius: '8px',
    transition: 'all 0.2s',
    ...style,
  };

  const handleFocus = (e) => {
    anime({
      targets: e.currentTarget,
      borderColor: colors.accentBlue,
      boxShadow: [`0 0 0 0px ${colors.accentBlue}20`, `0 0 0 3px ${colors.accentBlue}20`],
      duration: 200,
      easing: 'easeOutQuad',
    });
  };

  const handleBlur = (e) => {
    anime({
      targets: e.currentTarget,
      borderColor: colors.borderLight,
      boxShadow: 'none',
      duration: 200,
      easing: 'easeOutQuad',
    });
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      style={defaultStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}
