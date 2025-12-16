import { useState } from 'react';
import HelpGuideContent from './HelpGuide/HelpGuideContent';
import HelpGuideFooter from './HelpGuide/HelpGuideFooter';
import HelpGuideHeader from './HelpGuide/HelpGuideHeader';
import { colors } from './theme';

function HelpGuide({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await fetch('/api/help/dismiss', { method: 'POST' });
      } catch (error) {
        console.error('Failed to save help state:', error);
      }
    }
    onClose();
  };

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
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        border: 'none',
        margin: 0,
        width: '100%',
        height: '100%',
      }}
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      }}
    >
      <div
        role="document"
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '12px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <HelpGuideHeader onClose={handleClose} />
        <div style={{ padding: '24px' }}>
          <HelpGuideContent />
          <HelpGuideFooter
            dontShowAgain={dontShowAgain}
            setDontShowAgain={setDontShowAgain}
            onClose={handleClose}
          />
        </div>
      </div>
    </dialog>
  );
}

export default HelpGuide;
