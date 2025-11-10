function MessageDisplay({ message, error }) {
  if (!message && !error) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px 16px',
        background: message ? '#264f78' : '#5a1d1d',
        border: `1px solid ${message ? '#0e639c' : '#c72e2e'}`,
        borderRadius: '4px',
        color: message ? '#d4d4d4' : '#f48771',
        fontSize: '13px',
        lineHeight: '1.5',
      }}
    >
      {message || error}
    </div>
  );
}

export default MessageDisplay;
