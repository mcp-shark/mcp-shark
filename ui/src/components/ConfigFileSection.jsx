import { colors, fonts } from '../theme';
import DetectedPathsList from './DetectedPathsList';
import FileInput from './FileInput';
import ServiceSelector from './ServiceSelector';

export default function ConfigFileSection({
  detectedPaths,
  detecting,
  onDetect,
  onPathSelect,
  onViewConfig,
  filePath,
  fileContent,
  updatePath,
  onFileSelect,
  onPathChange,
  onUpdatePathChange,
  services,
  selectedServices,
  onSelectionChange,
}) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          Configuration File
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            lineHeight: '1.5',
            fontFamily: fonts.body,
          }}
        >
          Select your MCP configuration file or provide a file path. The file will be converted to
          MCP Shark format and used to start the server.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <DetectedPathsList
          detectedPaths={detectedPaths}
          detecting={detecting}
          onDetect={onDetect}
          onSelect={onPathSelect}
          onView={onViewConfig}
        />

        <FileInput
          filePath={filePath}
          fileContent={fileContent}
          updatePath={updatePath}
          onFileSelect={onFileSelect}
          onPathChange={onPathChange}
          onUpdatePathChange={onUpdatePathChange}
        />

        <ServiceSelector
          services={services}
          selectedServices={selectedServices}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}
