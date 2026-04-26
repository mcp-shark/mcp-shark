import { colors, fonts } from '../../theme';
import AAuthBadge from '../AAuthBadge';
import CollapsibleSection from '../CollapsibleSection';

function Field({ label, value, mono = false }) {
  if (!value) {
    return null;
  }
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '4px 0' }}>
      <div
        style={{
          minWidth: '140px',
          color: colors.textSecondary,
          fontSize: '11px',
          fontFamily: fonts.body,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: colors.textPrimary,
          fontSize: '12px',
          fontFamily: mono ? fonts.mono : fonts.body,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Renders an AAuth Identity panel for a single packet (request or response).
 * Always read-only and observation-only — values describe what was on the
 * wire, never claims of cryptographic validity.
 */
export default function AAuthIdentitySection({ aauth, titleColor }) {
  if (!aauth) {
    return null;
  }

  const hasAnySignal =
    aauth.posture !== 'none' ||
    aauth.agent ||
    aauth.mission ||
    aauth.requirement ||
    aauth.sig_present ||
    aauth.error;

  if (!hasAnySignal) {
    return null;
  }

  const coveredText =
    Array.isArray(aauth.sig_covered) && aauth.sig_covered.length > 0
      ? aauth.sig_covered.join(', ')
      : null;

  return (
    <CollapsibleSection
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Identity
          <AAuthBadge aauth={aauth} size="sm" />
        </span>
      }
      titleColor={titleColor || colors.accentBlue}
      defaultExpanded={true}
    >
      <div
        style={{
          padding: '12px 14px',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
        }}
      >
        <Field label="Agent" value={aauth.agent} mono />
        <Field label="Mission" value={aauth.mission} mono />
        <Field label="Signature" value={aauth.sig_present ? 'present (not verified)' : null} />
        <Field label="Algorithm" value={aauth.sig_alg} mono />
        <Field label="Key ID" value={aauth.sig_keyid_short || aauth.sig_keyid} mono />
        <Field label="Key thumbprint" value={aauth.key_thumbprint_short} mono />
        <Field label="Covered components" value={coveredText} mono />
        <Field label="Requirement" value={aauth.requirement} />
        <Field label="Signature error" value={aauth.error} />
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: `1px dashed ${colors.borderLight}`,
            color: colors.textTertiary,
            fontSize: '11px',
            fontFamily: fonts.body,
            lineHeight: 1.45,
          }}
        >
          mcp-shark records AAuth signals as observed only. No signatures are cryptographically
          verified. Learn more at{' '}
          <a
            href="https://www.aauth.dev"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: colors.accentBlue }}
          >
            aauth.dev
          </a>
          .
        </div>
      </div>
    </CollapsibleSection>
  );
}
