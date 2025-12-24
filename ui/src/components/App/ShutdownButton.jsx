import { IconPower } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import AlertModal from '../AlertModal';
import ConfirmationModal from '../ConfirmationModal';
import ShuttingDownModal from '../ShuttingDownModal';

/**
 * Shutdown button component
 * Shuts down the MCP Shark application
 */
export default function ShutdownButton() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showShuttingDownModal, setShowShuttingDownModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleShutdown = async () => {
    setShowShuttingDownModal(true);

    const { success, message } = await shutdownOrTimeout();
    if (success) {
      console.log('Shutdown successful');
      window.location.reload(); // reload the page to reset the app
    } else {
      setShowShuttingDownModal(false);
      setErrorMessage(message);
      setShowErrorModal(true);
    }
  };

  const handleClick = () => {
    setShowConfirmModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-tour="shutdown-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          padding: 0,
          color: colors.textSecondary,
          cursor: 'pointer',
          fontFamily: fonts.body,
          boxShadow: `0 4px 12px ${colors.shadowMd}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.color = colors.error;
          e.currentTarget.style.borderColor = colors.borderMedium;
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.bgCard;
          e.currentTarget.style.color = colors.textSecondary;
          e.currentTarget.style.borderColor = colors.borderLight;
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
        }}
        title="Shutdown MCP Shark"
      >
        <IconPower size={20} stroke={1.5} />
      </button>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleShutdown}
        title="Shutdown MCP Shark"
        message="Are you sure you want to shutdown MCP Shark? This will stop the server and all services."
        confirmText="Shutdown"
        cancelText="Cancel"
        danger={true}
      />
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Shutdown Failed"
        message={errorMessage}
        type="error"
      />
      <ShuttingDownModal isOpen={showShuttingDownModal} initialSeconds={3} />
    </>
  );
}

async function shutdownOrTimeout() {
  return Promise.race([callShutdown(), timeout(3000)]);
}
async function timeout(ms) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, message: 'Shutdown timed out' }), ms)
  );
}

async function callShutdown() {
  try {
    const response = await fetch('/api/composite/shutdown', {
      method: 'POST',
    });
    return { success: response.ok, message: response.message };
  } catch (error) {
    console.error('Shutdown error:', error);
    return { success: false, message: error.message || 'Failed to shutdown server' };
  }
}
