import { colors, fonts } from '../theme';

function TableHeader({ columnWidths }) {
  return (
    <thead
      style={{
        position: 'sticky',
        top: 0,
        background: colors.bgCard,
        zIndex: 10,
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <tr>
        <th
          style={{
            padding: '12px 16px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.frame}px`,
            minWidth: `${columnWidths.frame}px`,
            color: colors.textSecondary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: colors.bgCard,
          }}
        >
          No.
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.time}px`,
            minWidth: `${columnWidths.time}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.datetime}px`,
            minWidth: `${columnWidths.datetime}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Date/Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.source}px`,
            minWidth: `${columnWidths.source}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Source
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.destination}px`,
            minWidth: `${columnWidths.destination}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Destination
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.protocol}px`,
            minWidth: `${columnWidths.protocol}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Protocol
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.method}px`,
            minWidth: `${columnWidths.method}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Method
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.status}px`,
            minWidth: `${columnWidths.status}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Status
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.endpoint}px`,
            minWidth: `${columnWidths.endpoint}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Endpoint
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'right',
            borderBottom: `1px solid ${colors.borderLight}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.length}px`,
            minWidth: `${columnWidths.length}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Length
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '11px',
          }}
        >
          Info
        </th>
      </tr>
    </thead>
  );
}

export default TableHeader;
