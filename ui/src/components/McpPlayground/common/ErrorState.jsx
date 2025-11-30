import { colors, fonts } from '../../../theme';

export default function ErrorState({ message }) {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.error,
        fontFamily: fonts.body,
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}
