import { CloseIcon } from './TourTooltipIcons';

export default function TourTooltipHeader({ step, currentStep, totalSteps, isDragging, onSkip }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}
    >
      <div style={{ flex: 1, pointerEvents: 'none' }}>
        <h3 style={{ margin: 0, color: '#4ec9b0', fontSize: '16px', fontWeight: '600' }}>
          {step.title}
        </h3>
        <p style={{ margin: '4px 0 0 0', color: '#858585', fontSize: '12px' }}>
          Step {currentStep + 1} of {totalSteps}
          {isDragging && <span style={{ marginLeft: '8px', fontSize: '11px' }}>• Dragging</span>}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#858585',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          marginLeft: '12px',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3e3e42';
          e.currentTarget.style.color = '#d4d4d4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#858585';
        }}
        title="Skip tour"
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
