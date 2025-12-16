import { useRef } from 'react';
import { colors, fonts } from '../theme';
import TourTooltipButtons from './TourTooltip/TourTooltipButtons';
import TourTooltipHeader from './TourTooltip/TourTooltipHeader';
import { useTooltipPosition } from './TourTooltip/useTooltipPosition';

function TourTooltip({ elementRect, step, currentStep, totalSteps, onNext, onPrevious, onSkip }) {
  const tooltipRef = useRef(null);
  const { position, isDragging, handleMouseDown } = useTooltipPosition(
    elementRect,
    step,
    currentStep
  );

  if (!elementRect) {
    return null;
  }

  return (
    <button
      type="button"
      ref={tooltipRef}
      onMouseDown={(e) => handleMouseDown(e, tooltipRef)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMouseDown(e, tooltipRef);
        }
      }}
      aria-label="Draggable tooltip"
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: position.transform,
        background: colors.bgCard,
        border: `2px solid ${colors.accentBlue}`,
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '350px',
        minWidth: '300px',
        boxShadow: `0 4px 20px ${colors.shadowLg}`,
        zIndex: 10001,
        pointerEvents: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onClick={(e) => {
        const target = e.target;
        if (
          target.tagName !== 'BUTTON' &&
          target.tagName !== 'INPUT' &&
          !target.closest('button')
        ) {
          e.stopPropagation();
        }
      }}
    >
      <TourTooltipHeader
        step={step}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isDragging={isDragging}
        onSkip={onSkip}
      />

      <div
        style={{
          color: colors.textPrimary,
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '20px',
          pointerEvents: 'none',
          fontFamily: fonts.body,
        }}
      >
        {step.content}
      </div>

      <TourTooltipButtons
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        onSkip={onSkip}
      />
    </button>
  );
}

export default TourTooltip;
