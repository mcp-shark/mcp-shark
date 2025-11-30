import { useState } from 'react';
import { colors, fonts } from '../../theme';
import { getRiskLevelColor } from './utils';

function ExpandableSection({ title, count, children, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        background: colors.bgTertiary,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: fonts.body,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgCard;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            {title}
          </span>
          <span
            style={{
              padding: '2px 6px',
              background: colors.bgCard,
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '500',
              color: colors.textSecondary,
              border: `1px solid ${colors.borderLight}`,
              fontFamily: fonts.body,
            }}
          >
            {count}
          </span>
        </div>
        <svg
          style={{
            width: '14px',
            height: '14px',
            color: colors.textSecondary,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div
          style={{
            padding: '12px',
            borderTop: `1px solid ${colors.borderLight}`,
            background: colors.bgCard,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function FindingsTable({ findings, type }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '12px', fontFamily: fonts.body }}>
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${colors.borderLight}`,
              background: colors.bgTertiary,
            }}
          >
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Name
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Risk Level
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Risk Score
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tags
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Reasons
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Safe Use Notes
            </th>
            {type === 'tool' && (
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Poisoned
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => (
            <tr
              key={index}
              style={{
                borderBottom: `1px solid ${colors.borderLight}`,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
              >
                {finding.name}
              </td>
              <td style={{ padding: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: colors.textInverse,
                    background: getRiskLevelColor(finding.risk_level),
                    fontFamily: fonts.body,
                  }}
                >
                  {finding.risk_level.toUpperCase()}
                </span>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                {finding.risk_score}
              </td>
              <td style={{ padding: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {finding.risk_tags?.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        padding: '2px 6px',
                        background: colors.bgCard,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: colors.textSecondary,
                        border: `1px solid ${colors.borderLight}`,
                        fontFamily: fonts.body,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                <ul
                  style={{ listStyle: 'disc', listStylePosition: 'inside', margin: 0, padding: 0 }}
                >
                  {finding.reasons?.map((reason, reasonIndex) => (
                    <li key={reasonIndex} style={{ fontSize: '10px', marginBottom: '2px' }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </td>
              <td
                style={{
                  padding: '8px',
                  fontSize: '10px',
                  color: colors.textSecondary,
                  maxWidth: '200px',
                  fontFamily: fonts.body,
                }}
              >
                {finding.safe_use_notes}
              </td>
              {type === 'tool' && finding.hasOwnProperty('is_potentially_poisoned') && (
                <td style={{ padding: '8px' }}>
                  {finding.is_potentially_poisoned ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        background: colors.error + '20',
                        color: colors.error,
                        border: `1px solid ${colors.error}40`,
                        fontFamily: fonts.body,
                      }}
                    >
                      Yes
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        borderRadius: '4px',
                        background: colors.accentGreen + '20',
                        color: colors.accentGreen,
                        border: `1px solid ${colors.accentGreen}40`,
                        fontFamily: fonts.body,
                      }}
                    >
                      No
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalysisResult({ analysis }) {
  if (!analysis) {
    return (
      <div
        style={{
          padding: '12px',
          background: colors.bgTertiary + '80',
          borderRadius: '6px',
          border: `1px solid ${colors.borderLight}`,
          fontSize: '12px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
        }}
      >
        No analysis data available.
      </div>
    );
  }

  const toolFindings = analysis.tool_findings || [];
  const promptFindings = analysis.prompt_findings || [];
  const resourceFindings = analysis.resource_findings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Overall Summary */}
      {analysis.overall_risk_level && (
        <ExpandableSection
          title="Overall Summary"
          count={analysis.overall_reason ? 1 : 0}
          defaultExpanded={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                }}
              >
                Overall Risk Level:
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: colors.textInverse,
                  background: getRiskLevelColor(analysis.overall_risk_level),
                  fontFamily: fonts.body,
                }}
              >
                {analysis.overall_risk_level.toUpperCase()}
              </span>
            </div>
            {analysis.overall_reason && (
              <div
                style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: fonts.body }}
              >
                {(() => {
                  const separator = analysis.overall_reason.includes('\n')
                    ? '\n'
                    : analysis.overall_reason.includes(' | ')
                      ? ' | '
                      : null;

                  if (separator) {
                    return (
                      <ul
                        style={{
                          listStyle: 'disc',
                          listStylePosition: 'inside',
                          margin: 0,
                          paddingLeft: '8px',
                        }}
                      >
                        {analysis.overall_reason.split(separator).map((item, index) => (
                          <li key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p style={{ fontSize: '12px' }}>{analysis.overall_reason}</p>;
                })()}
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Tool Findings */}
      {toolFindings.length > 0 && (
        <ExpandableSection title="Tool Findings" count={toolFindings.length} defaultExpanded={true}>
          <FindingsTable findings={toolFindings} type="tool" />
        </ExpandableSection>
      )}

      {/* Prompt Findings */}
      {promptFindings.length > 0 && (
        <ExpandableSection
          title="Prompt Findings"
          count={promptFindings.length}
          defaultExpanded={true}
        >
          <FindingsTable findings={promptFindings} type="prompt" />
        </ExpandableSection>
      )}

      {/* Resource Findings */}
      {resourceFindings.length > 0 && (
        <ExpandableSection
          title="Resource Findings"
          count={resourceFindings.length}
          defaultExpanded={true}
        >
          <FindingsTable findings={resourceFindings} type="resource" />
        </ExpandableSection>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <ExpandableSection
          title="Recommendations"
          count={analysis.recommendations.length}
          defaultExpanded={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px',
                  background: colors.accentBlue + '10',
                  borderRadius: '6px',
                  border: `1px solid ${colors.accentBlue}20`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.accentBlue + '15';
                  e.currentTarget.style.borderColor = colors.accentBlue + '40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.accentBlue + '10';
                  e.currentTarget.style.borderColor = colors.accentBlue + '20';
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: colors.accentBlue + '30',
                    border: `1px solid ${colors.accentBlue}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: colors.accentBlue,
                      fontFamily: fonts.body,
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    lineHeight: '1.5',
                    flex: 1,
                    margin: 0,
                    fontFamily: fonts.body,
                  }}
                >
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Notable Patterns */}
      {analysis.notable_patterns && analysis.notable_patterns.length > 0 && (
        <ExpandableSection
          title="Notable Patterns"
          count={analysis.notable_patterns.length}
          defaultExpanded={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.notable_patterns.map((pattern, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px',
                  background: colors.accentOrange + '10',
                  borderRadius: '6px',
                  border: `1px solid ${colors.accentOrange}20`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.accentOrange + '15';
                  e.currentTarget.style.borderColor = colors.accentOrange + '40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.accentOrange + '10';
                  e.currentTarget.style.borderColor = colors.accentOrange + '20';
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: colors.accentOrange + '30',
                    border: `1px solid ${colors.accentOrange}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    style={{ width: '10px', height: '10px', color: colors.accentOrange }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    lineHeight: '1.5',
                    flex: 1,
                    margin: 0,
                    fontFamily: fonts.body,
                  }}
                >
                  {pattern}
                </p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
}
