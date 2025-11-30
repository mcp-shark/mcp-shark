import { useState } from 'react';
import { colors } from './theme';
import HelpGuideHeader from './HelpGuide/HelpGuideHeader';
import HelpGuideContent from './HelpGuide/HelpGuideContent';
import HelpGuideFooter from './HelpGuide/HelpGuideFooter';

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
    <div
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
      }}
      onClick={handleClose}
    >
      <div
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
    </div>
  );
}

export default HelpGuide;
