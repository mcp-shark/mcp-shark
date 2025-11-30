import { colors, fonts } from '../../../theme';

export default function LoadingState({ message }) {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}
