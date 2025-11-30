import { colors, fonts } from '../theme';

function FileInput({
  filePath,
  fileContent,
  updatePath,
  onFileSelect,
  onPathChange,
  onUpdatePathChange,
}) {
  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label
          data-tour="select-file"
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            border: `1px solid ${colors.buttonPrimary}`,
            color: colors.textInverse,
            cursor: 'pointer',
            fontSize: '13px',
            borderRadius: '8px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonPrimaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.buttonPrimary;
          }}
        >
          Select File
          <input type="file" accept=".json" onChange={onFileSelect} style={{ display: 'none' }} />
        </label>
        <span
          style={{
            color: colors.textTertiary,
            fontSize: '13px',
            fontWeight: '500',
            fontFamily: fonts.body,
          }}
        >
          OR
        </span>
        <input
          type="text"
          placeholder="Enter file path (e.g., ~/.cursor/mcp.json)"
          value={filePath}
          onChange={onPathChange}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: colors.bgCard,
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textPrimary,
            fontSize: '13px',
            borderRadius: '8px',
          }}
        />
      </div>
      {fileContent && !filePath && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}
          >
            Optional: File Path to Update
          </label>
          <input
            type="text"
            placeholder="Enter file path to update (e.g., ~/.cursor/mcp.json)"
            value={updatePath}
            onChange={onUpdatePathChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: colors.bgCard,
              border: `1px solid ${colors.borderMedium}`,
              color: colors.textPrimary,
              fontSize: '13px',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginTop: '6px',
              fontFamily: fonts.body,
            }}
          >
            Provide the file path if you want to update the original config file (backup will be
            created)
          </div>
        </div>
      )}
      {fileContent && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              color: colors.textSecondary,
              fontSize: '12px',
              marginBottom: '6px',
              fontWeight: '500',
            }}
          >
            File Content Preview
          </div>
          <pre
            style={{
              background: colors.bgCard,
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: colors.textPrimary,
              maxHeight: '200px',
              overflow: 'auto',
              border: `1px solid ${colors.borderLight}`,
              lineHeight: '1.5',
            }}
          >
            {fileContent}
          </pre>
        </div>
      )}
    </>
  );
}

export default FileInput;
