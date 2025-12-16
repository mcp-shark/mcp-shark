import { colors, fonts } from '../../theme';
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
        <h3
          style={{
            margin: 0,
            color: colors.accentBlue,
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: fonts.body,
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            margin: '4px 0 0 0',
            color: colors.textTertiary,
            fontSize: '12px',
            fontFamily: fonts.body,
          }}
        >
          Step {currentStep + 1} of {totalSteps}
          {isDragging && <span style={{ marginLeft: '8px', fontSize: '11px' }}>• Dragging</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.textTertiary,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          marginLeft: '12px',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.textTertiary;
        }}
        title="Skip tour"
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
