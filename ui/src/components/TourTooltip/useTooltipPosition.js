import { useEffect, useState } from 'react';

export function useTooltipPosition(elementRect, step, _currentStep) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTooltipPosition({ x: 0, y: 0 });
  }, []);

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
    if (!isDragging) {
      return;
    }

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
    if (!elementRect) {
      return { left: 0, top: 0, transform: 'none' };
    }

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

    const calculatePosition = (position, elementRect, tooltipWidth, tooltipHeight, spacing) => {
      if (position === 'left') {
        const baseLeft = elementRect.left - tooltipWidth - spacing;
        const left = baseLeft < 10 ? elementRect.right + spacing : baseLeft;
        return {
          left,
          top: elementRect.top + elementRect.height / 2,
          transform: 'translateY(-50%)',
        };
      }

      if (position === 'right') {
        const baseLeft = elementRect.right + spacing;
        const left =
          baseLeft + tooltipWidth > window.innerWidth - 10
            ? elementRect.left - tooltipWidth - spacing
            : baseLeft;
        return {
          left,
          top: elementRect.top + elementRect.height / 2,
          transform: 'translateY(-50%)',
        };
      }

      if (position === 'top') {
        const baseTop = elementRect.top - tooltipHeight - spacing;
        const top = baseTop < 10 ? elementRect.bottom + spacing : baseTop;
        return {
          left: elementRect.left + elementRect.width / 2,
          top,
          transform: 'translate(-50%, 0)',
        };
      }

      // bottom (default)
      const baseTop = elementRect.bottom + spacing;
      const top =
        baseTop + tooltipHeight > window.innerHeight - 10
          ? elementRect.top - tooltipHeight - spacing
          : baseTop;
      return {
        left: elementRect.left + elementRect.width / 2,
        top,
        transform: 'translate(-50%, 0)',
      };
    };

    const rawPosition = calculatePosition(
      position,
      elementRect,
      tooltipWidth,
      tooltipHeight,
      spacing
    );
    const left = Math.max(10, Math.min(rawPosition.left, window.innerWidth - tooltipWidth - 10));
    const top = Math.max(10, Math.min(rawPosition.top, window.innerHeight - tooltipHeight - 10));

    return { left, top, transform: rawPosition.transform };
  };

  return {
    position: calculatePosition(),
    isDragging,
    handleMouseDown,
  };
}
