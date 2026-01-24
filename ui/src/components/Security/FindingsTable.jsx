import React from 'react';
import { colors, fonts } from '../../theme';
import FindingDetailRow from './FindingDetailRow.jsx';
import FindingRow from './FindingRow.jsx';

function FindingsTable({ findings, selectedFinding, onSelectFinding }) {
  if (!findings || findings.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          No security findings yet. Run a scan to detect vulnerabilities.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.heading,
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
        }}
      >
        Findings ({findings.length})
      </h3>

      <div
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: fonts.body,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Severity
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                OWASP
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Finding
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  background: colors.bgSecondary,
                }}
              >
                Server
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  width: '40px',
                  background: colors.bgSecondary,
                }}
              />
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => {
              const isSelected = selectedFinding?.id === finding.id;
              return (
                <React.Fragment key={finding.id}>
                  <FindingRow
                    finding={finding}
                    isSelected={isSelected}
                    onSelect={onSelectFinding}
                  />
                  {isSelected && <FindingDetailRow finding={finding} colSpan={5} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FindingsTable;
