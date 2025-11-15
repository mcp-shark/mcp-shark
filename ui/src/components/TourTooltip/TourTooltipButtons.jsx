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
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'transparent',
          border: '1px solid #3e3e42',
          color: '#858585',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          flex: 1,
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2d2d30';
          e.currentTarget.style.color = '#d4d4d4';
          e.currentTarget.style.borderColor = '#3e3e42';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#858585';
          e.currentTarget.style.borderColor = '#3e3e42';
        }}
      >
        Skip Tour
      </button>
      <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
        {currentStep > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: '#2d2d30',
              border: '1px solid #3e3e42',
              color: '#d4d4d4',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2d2d30';
            }}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            background: '#0e639c',
            border: 'none',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1177bb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0e639c';
          }}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          {currentStep < totalSteps - 1 && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}
