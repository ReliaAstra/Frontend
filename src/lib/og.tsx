import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const ACCENT = '#0891B2';
const BG = '#08080C';

interface OgOptions {
  /** Small uppercase label above the title. */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Optional stat rendered large on the right / bottom. */
  stat?: { value: string; label: string };
  /** Chips rendered along the bottom. */
  chips?: string[];
  /** Accent colour override, e.g. a vendor brand colour. */
  accent?: string;
}

/**
 * Shared Open Graph card. Rendered with Satori via next/og at build time for
 * static routes, so no runtime font fetching or network access is required.
 */
export function renderOgImage({
  eyebrow,
  title,
  subtitle,
  stat,
  chips,
  accent = ACCENT,
}: OgOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            right: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${accent}38 0%, ${accent}00 68%)`,
            display: 'flex',
          }}
        />
        {/* Top accent rule */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 6,
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}00 72%)`,
            display: 'flex',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ color: '#FAFAFA', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
              reliastra
            </span>
            <span style={{ color: accent, fontSize: 34, fontWeight: 700 }}>.</span>
          </div>
          <span
            style={{
              color: accent,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: stat ? 720 : 1000 }}>
          <div
            style={{
              color: '#FAFAFA',
              fontSize: title.length > 44 ? 62 : 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              display: 'flex',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                color: '#A1A1AA',
                fontSize: 27,
                lineHeight: 1.45,
                marginTop: 26,
                display: 'flex',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {(chips ?? []).slice(0, 4).map((chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 999,
                  padding: '10px 20px',
                  color: '#D4D4D8',
                  fontSize: 19,
                  fontWeight: 500,
                }}
              >
                {chip}
              </div>
            ))}
          </div>

          {stat ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: accent, fontSize: 68, fontWeight: 800, letterSpacing: -2 }}>
                {stat.value}
              </span>
              <span
                style={{
                  color: '#71717A',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </span>
            </div>
          ) : (
            <span style={{ color: '#52525B', fontSize: 20, fontWeight: 500 }}>reliastra.com</span>
          )}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
