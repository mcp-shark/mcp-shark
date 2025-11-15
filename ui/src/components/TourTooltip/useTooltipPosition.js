import { useState, useEffect } from 'react';

export function useTooltipPosition(elementRect, step, currentStep) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTooltipPosition({ x: 0, y: 0 });
  }, [currentStep]);

  const handleMouseDown = (e, tooltipRef) => {
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

  const calculatePosition = () => {
    if (!elementRect) return { left: 0, top: 0, transform: 'none' };

    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const spacing = 20;

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

  return {
    position: calculatePosition(),
    isDragging,
    handleMouseDown,
  };
}
