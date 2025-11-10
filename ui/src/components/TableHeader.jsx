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
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.frame}px`,
            minWidth: `${columnWidths.frame}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          No.
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.time}px`,
            minWidth: `${columnWidths.time}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.datetime}px`,
            minWidth: `${columnWidths.datetime}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Date/Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.source}px`,
            minWidth: `${columnWidths.source}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Source
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.destination}px`,
            minWidth: `${columnWidths.destination}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Destination
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.protocol}px`,
            minWidth: `${columnWidths.protocol}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Protocol
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.method}px`,
            minWidth: `${columnWidths.method}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Method
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.status}px`,
            minWidth: `${columnWidths.status}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Status
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.endpoint}px`,
            minWidth: `${columnWidths.endpoint}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Endpoint
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'right',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.length}px`,
            minWidth: `${columnWidths.length}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Length
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Info
        </th>
      </tr>
    </thead>
  );
}

export default TableHeader;
