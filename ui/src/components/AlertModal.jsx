import { colors, fonts } from '../theme';

/**
 * Alert modal for displaying error or info messages
 * Replaces browser alert() function with a proper modal
 */
function AlertModal({ isOpen, onClose, title, message, type = 'error' }) {
  if (!isOpen) {
    return null;
  }

  const isError = type === 'error';

  return (
    <dialog
      open
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        border: 'none',
        margin: 0,
        width: '100%',
        height: '100%',
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          onClose();
        }
      }}
    >
      <div
        role="document"
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: `0 4px 20px ${colors.shadowLg}`,
          fontFamily: fonts.body,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: isError ? colors.error : colors.textPrimary,
          }}
        >
          {title || (isError ? 'Error' : 'Information')}
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: '1.5',
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: isError ? colors.buttonDanger : colors.buttonPrimary,
              border: 'none',
              borderRadius: '8px',
              color: colors.textInverse,
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: fonts.body,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isError
                ? colors.buttonDangerHover
                : colors.buttonPrimaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isError
                ? colors.buttonDanger
                : colors.buttonPrimary;
            }}
          >
            OK
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default AlertModal;
