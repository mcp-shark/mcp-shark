import { useEffect, useRef, useState } from 'react';
import TourOverlay from './components/TourOverlay';
import TourTooltip from './components/TourTooltip';

function IntroTour({ steps, onComplete, onSkip, onStepChange }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [elementRect, setElementRect] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!highlightedElement) {
      return;
    }

    const updatePosition = () => {
      if (highlightedElement) {
        const rect = highlightedElement.getBoundingClientRect();
        setElementRect(rect);
      }
    };

    updatePosition();

    const options = { passive: true, capture: true };
    window.addEventListener('scroll', updatePosition, options);
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updatePosition, options);
      window.removeEventListener('resize', updatePosition, { passive: true });
    };
  }, [highlightedElement]);

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const step = steps[currentStep];
    if (!step) {
      return;
    }

    if (onStepChange) {
      onStepChange(currentStep);
    }

    const timer = setTimeout(() => {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setElementRect(rect);
        }, 300);
      } else {
        setHighlightedElement(null);
        setElementRect(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onStepChange]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) {
        onStepChange(prevStep);
      }
    }
  };

  const handleComplete = async () => {
    try {
      await fetch('/api/help/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourCompleted: true }),
      });
    } catch (error) {
      console.error('Failed to save tour state:', error);
    }
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
    if (onSkip) onSkip();
  };

  if (steps.length === 0 || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <>
      <div
        ref={overlayRef}
        role="presentation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          pointerEvents: 'auto',
        }}
        onClick={handleSkip}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleSkip();
          }
        }}
      >
        <TourOverlay elementRect={elementRect} />
      </div>

      {elementRect && (
        <TourTooltip
          elementRect={elementRect}
          step={step}
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}

export default IntroTour;
