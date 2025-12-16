function TourOverlay({ elementRect, _onClick }) {
  if (!elementRect) {
    return (
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
    );
  }

  const highlightPadding = 8;
  const highlightBorderWidth = 3;

  return (
    <>
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
  );
}

export default TourOverlay;
