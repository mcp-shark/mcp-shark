import { colors, fonts } from '../../theme';
import { ChevronLeft, ChevronRight } from './TourTooltipIcons';

export default function TourTooltipButtons({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'transparent',
          border: `1px solid ${colors.borderMedium}`,
          color: colors.textSecondary,
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: fonts.body,
          flex: 1,
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.color = colors.textPrimary;
          e.currentTarget.style.borderColor = colors.borderMedium;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.textSecondary;
          e.currentTarget.style.borderColor = colors.borderMedium;
        }}
      >
        Skip Tour
      </button>
      <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: colors.buttonSecondary,
              border: `1px solid ${colors.borderMedium}`,
              color: colors.textPrimary,
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: fonts.body,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.buttonSecondaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonSecondary;
            }}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            background: colors.buttonPrimary,
            border: 'none',
            color: colors.textInverse,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonPrimaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.buttonPrimary;
          }}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          {currentStep < totalSteps - 1 && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}
