import { useState, useEffect, useRef } from 'react';

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

function TourTooltip({ elementRect, step, currentStep, totalSteps, onNext, onPrevious, onSkip }) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setTooltipPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    setTooltipPosition({ x: 0, y: 0 });
  }, [currentStep]);

  if (!elementRect) {
    return null;
  }

  const tooltipWidth = 350;
  const tooltipHeight = 200;
  const spacing = 20;

  const calculatePosition = () => {
    if (tooltipPosition.x !== 0 || tooltipPosition.y !== 0) {
      const left = Math.max(10, Math.min(tooltipPosition.x, window.innerWidth - tooltipWidth - 10));
      const top = Math.max(
        10,
        Math.min(tooltipPosition.y, window.innerHeight - tooltipHeight - 10)
      );
      return { left, top, transform: 'none' };
    }

    const position = step.position || 'bottom';
    let left, top, transform;

    if (position === 'left') {
      left = elementRect.left - tooltipWidth - spacing;
      top = elementRect.top + elementRect.height / 2;
      transform = 'translateY(-50%)';
      if (left < 10) {
        left = elementRect.right + spacing;
      }
    } else if (position === 'right') {
      left = elementRect.right + spacing;
      top = elementRect.top + elementRect.height / 2;
      transform = 'translateY(-50%)';
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = elementRect.left - tooltipWidth - spacing;
      }
    } else if (position === 'top') {
      left = elementRect.left + elementRect.width / 2;
      top = elementRect.top - tooltipHeight - spacing;
      transform = 'translate(-50%, 0)';
      if (top < 10) {
        top = elementRect.bottom + spacing;
      }
    } else {
      left = elementRect.left + elementRect.width / 2;
      top = elementRect.bottom + spacing;
      transform = 'translate(-50%, 0)';
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = elementRect.top - tooltipHeight - spacing;
      }
    }

    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));

    return { left, top, transform };
  };

  const { left, top, transform } = calculatePosition();

  return (
    <div
      ref={tooltipRef}
      onMouseDown={handleMouseDown}
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
    </div>
  );
}

export default TourTooltip;
