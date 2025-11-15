import { useEffect, useRef } from 'react';
import { colors, fonts } from '../../theme';
import anime from 'animejs';

export default function LoadingModal({ show }) {
  const loadingModalRef = useRef(null);
  const spinnerRef = useRef(null);
  const dotsRef = useRef([]);

  useEffect(() => {
    if (show && loadingModalRef.current) {
      anime({
        targets: loadingModalRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (spinnerRef.current) {
        anime({
          targets: spinnerRef.current,
          rotate: 360,
          duration: 2000,
          loop: true,
          easing: 'linear',
        });
      }

      if (dotsRef.current.length > 0) {
        anime({
          targets: dotsRef.current,
          translateY: [0, -10, 0],
          duration: 1200,
          delay: anime.stagger(200),
          loop: true,
          easing: 'easeInOutQuad',
        });
      }
    } else if (!show && loadingModalRef.current) {
      anime({
        targets: loadingModalRef.current,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 300,
        easing: 'easeInExpo',
        complete: () => {
          if (loadingModalRef.current) {
            loadingModalRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={loadingModalRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(245, 243, 240, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        borderRadius: '8px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '16px',
          padding: '32px',
          boxShadow: `0 8px 32px ${colors.shadowMd}`,
          maxWidth: '320px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        <div
          ref={spinnerRef}
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 20px',
            position: 'relative',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={colors.accentBlue}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="44 132"
              opacity="0.3"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={colors.accentBlue}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="22 132"
              strokeDashoffset="11"
            />
          </svg>
        </div>

        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            marginBottom: '8px',
          }}
        >
          Waiting for MCP Server
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            marginBottom: '20px',
          }}
        >
          Waiting till MCP server starts...
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) dotsRef.current[i] = el;
              }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: colors.accentBlue,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
