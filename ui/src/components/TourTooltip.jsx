import { useRef } from 'react';
import TourTooltipHeader from './TourTooltip/TourTooltipHeader';
import TourTooltipButtons from './TourTooltip/TourTooltipButtons';
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
    <div
      ref={tooltipRef}
      onMouseDown={(e) => handleMouseDown(e, tooltipRef)}
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: position.transform,
        background: '#252526',
        border: '2px solid #0e639c',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '350px',
        minWidth: '300px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
          color: '#d4d4d4',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '20px',
          pointerEvents: 'none',
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
    </div>
  );
}

export default TourTooltip;
