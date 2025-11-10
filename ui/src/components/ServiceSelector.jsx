import { colors, fonts } from '../theme';

function ServiceSelector({ services, selectedServices, onSelectionChange }) {
  if (services.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          Select Services
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            lineHeight: '1.5',
            fontFamily: fonts.body,
          }}
        >
          Choose which services to include in the MCP Shark server. Only selected services will be
          available.
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => {
            onSelectionChange(new Set(services.map((s) => s.name)));
          }}
          style={{
            padding: '4px 12px',
            background: 'transparent',
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
            borderRadius: '4px',
          }}
        >
          Select All
        </button>
        <button
          onClick={() => {
            onSelectionChange(new Set());
          }}
          style={{
            padding: '4px 12px',
            background: 'transparent',
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
            borderRadius: '4px',
          }}
        >
          Deselect All
        </button>
        <div
          style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {selectedServices.size} of {services.length} selected
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '8px',
          background: colors.bgPrimary,
          borderRadius: '4px',
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        {services.map((service) => {
          const isSelected = selectedServices.has(service.name);
          return (
            <label
              key={service.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: isSelected ? `${colors.accentBlue}15` : 'transparent',
                border: `1px solid ${isSelected ? colors.accentBlue : colors.borderMedium}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = colors.bgHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  const newSelected = new Set(selectedServices);
                  if (e.target.checked) {
                    newSelected.add(service.name);
                  } else {
                    newSelected.delete(service.name);
                  }
                  onSelectionChange(newSelected);
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: colors.textPrimary,
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  {service.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      padding: '2px 6px',
                      background: service.type === 'http' ? '#0e639c' : '#4a9e5f',
                      color: colors.textInverse,
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: '500',
                    }}
                  >
                    {service.type.toUpperCase()}
                  </span>
                  {service.url && (
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{service.url}</span>
                  )}
                  {service.command && (
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      {service.command} {service.args?.join(' ') || ''}
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {selectedServices.size === 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#5a1d1d',
            border: `1px solid #c72e2e`,
            borderRadius: '4px',
            color: '#f48771',
            fontSize: '12px',
          }}
        >
          ⚠️ Please select at least one service to start the server
        </div>
      )}
    </div>
  );
}

export default ServiceSelector;
