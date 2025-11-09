import { useState, useEffect, useRef } from 'react';

// SVG Icon Components
const CloseIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronRight = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeft = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

function IntroTour({ steps, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [elementRect, setElementRect] = useState(null);
  const overlayRef = useRef(null);

  // Update element position on scroll/resize
  useEffect(() => {
    if (!highlightedElement) return;

    const updatePosition = () => {
      if (highlightedElement) {
        const rect = highlightedElement.getBoundingClientRect();
        setElementRect(rect);
      }
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize - use capture phase for all scroll events
    const options = { passive: true, capture: true };
    window.addEventListener('scroll', updatePosition, options);
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updatePosition, options);
      window.removeEventListener('resize', updatePosition, { passive: true });
    };
  }, [highlightedElement]);

  useEffect(() => {
    if (steps.length === 0) return;

    const step = steps[currentStep];
    if (!step) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Find the target element
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        // Scroll element into view with padding
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        // Update position after scroll
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setElementRect(rect);
        }, 300);
      } else {
        setHighlightedElement(null);
        setElementRect(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
  const highlightPadding = 8;
  const highlightBorderWidth = 3;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
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
      >
        {/* Dark overlay background with cutout using box-shadow technique */}
        {elementRect ? (
          <>
            {/* Top overlay */}
            {elementRect.top > 0 && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${elementRect.top - highlightPadding}px`,
                  background: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 9999,
                }}
              />
            )}
            {/* Bottom overlay */}
            {elementRect.bottom < window.innerHeight && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${window.innerHeight - elementRect.bottom - highlightPadding}px`,
                  background: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 9999,
                }}
              />
            )}
            {/* Left overlay */}
            {elementRect.left > 0 && (
              <div
                style={{
                  position: 'fixed',
                  top: `${Math.max(0, elementRect.top - highlightPadding)}px`,
                  left: 0,
                  width: `${elementRect.left - highlightPadding}px`,
                  height: `${elementRect.height + highlightPadding * 2}px`,
                  background: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 9999,
                }}
              />
            )}
            {/* Right overlay */}
            {elementRect.right < window.innerWidth && (
              <div
                style={{
                  position: 'fixed',
                  top: `${Math.max(0, elementRect.top - highlightPadding)}px`,
                  right: 0,
                  width: `${window.innerWidth - elementRect.right - highlightPadding}px`,
                  height: `${elementRect.height + highlightPadding * 2}px`,
                  background: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 9999,
                }}
              />
            )}
            {/* Highlight border/glow - more visible */}
            <div
              style={{
                position: 'fixed',
                left: elementRect.left - highlightPadding - highlightBorderWidth,
                top: elementRect.top - highlightPadding - highlightBorderWidth,
                width: elementRect.width + (highlightPadding + highlightBorderWidth) * 2,
                height: elementRect.height + (highlightPadding + highlightBorderWidth) * 2,
                border: `${highlightBorderWidth}px solid #4ec9b0`,
                borderRadius: '8px',
                boxShadow:
                  '0 0 0 2px rgba(78, 201, 176, 0.3), ' +
                  '0 0 20px rgba(78, 201, 176, 0.5), ' +
                  '0 0 40px rgba(78, 201, 176, 0.3), ' +
                  'inset 0 0 20px rgba(78, 201, 176, 0.1)',
                zIndex: 10000,
                pointerEvents: 'none',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <style>
              {`
                @keyframes pulse {
                  0%, 100% {
                    box-shadow: 
                      0 0 0 2px rgba(78, 201, 176, 0.3),
                      0 0 20px rgba(78, 201, 176, 0.5),
                      0 0 40px rgba(78, 201, 176, 0.3),
                      inset 0 0 20px rgba(78, 201, 176, 0.1);
                  }
                  50% {
                    box-shadow: 
                      0 0 0 3px rgba(78, 201, 176, 0.4),
                      0 0 30px rgba(78, 201, 176, 0.7),
                      0 0 60px rgba(78, 201, 176, 0.5),
                      inset 0 0 30px rgba(78, 201, 176, 0.2);
                  }
                }
              `}
            </style>
          </>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {elementRect &&
        (() => {
          // Calculate tooltip position with boundary checks
          const tooltipWidth = 350;
          const tooltipHeight = 200; // Approximate
          const spacing = 20;

          let left, top, transform;

          if (step.position === 'left') {
            left = elementRect.left - tooltipWidth - spacing;
            top = elementRect.top + elementRect.height / 2;
            transform = 'translateY(-50%)';
            // Adjust if off-screen
            if (left < 10) {
              left = elementRect.right + spacing;
              transform = 'translateY(-50%)';
            }
          } else if (step.position === 'right') {
            left = elementRect.right + spacing;
            top = elementRect.top + elementRect.height / 2;
            transform = 'translateY(-50%)';
            // Adjust if off-screen
            if (left + tooltipWidth > window.innerWidth - 10) {
              left = elementRect.left - tooltipWidth - spacing;
              transform = 'translateY(-50%)';
            }
          } else if (step.position === 'top') {
            left = elementRect.left + elementRect.width / 2;
            top = elementRect.top - tooltipHeight - spacing;
            transform = 'translate(-50%, 0)';
            // Adjust if off-screen
            if (top < 10) {
              top = elementRect.bottom + spacing;
              transform = 'translate(-50%, 0)';
            }
          } else {
            // bottom (default)
            left = elementRect.left + elementRect.width / 2;
            top = elementRect.bottom + spacing;
            transform = 'translate(-50%, 0)';
            // Adjust if off-screen
            if (top + tooltipHeight > window.innerHeight - 10) {
              top = elementRect.top - tooltipHeight - spacing;
              transform = 'translate(-50%, 0)';
            }
          }

          // Ensure tooltip stays within viewport
          left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
          top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));

          return (
            <div
              style={{
                position: 'fixed',
                left: `${left}px`,
                top: `${top}px`,
                transform,
                background: '#252526',
                border: '2px solid #0e639c',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '350px',
                minWidth: '300px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                zIndex: 10001,
                pointerEvents: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#4ec9b0', fontSize: '16px', fontWeight: '600' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#858585', fontSize: '12px' }}>
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
                <button
                  onClick={handleSkip}
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

              {/* Content */}
              <div
                style={{
                  color: '#d4d4d4',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                {step.content}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <button
                  onClick={handleSkip}
                  style={{
                    background: 'transparent',
                    border: '1px solid #3e3e42',
                    color: '#858585',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    flex: 1,
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
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
                    onClick={handleNext}
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
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep < steps.length - 1 && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}

export default IntroTour;
