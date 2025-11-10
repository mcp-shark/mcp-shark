// Shark Logo Component
// Uses the og-image.png logo

export const SharkLogo = ({ size = 32, className = '', style = {} }) => {
  return (
    <img
      src="/og-image.png"
      alt="MCP Shark Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        ...style,
      }}
      aria-label="MCP Shark Logo"
    />
  );
};
