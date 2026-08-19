'use client';

/**
 * Compact monogram used in the vendor selector. We deliberately avoid
 * reproducing third-party logos — a tinted initial keeps the UI clean and
 * avoids implying any endorsement or partnership.
 */
export function VendorMark({
  name,
  color,
  size = 32,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean);
  // Multi-word names use one letter per word; single words use their first two.
  const initials = (
    words.length > 1 ? words.slice(0, 2).map((w) => w[0]).join('') : (words[0] ?? '').slice(0, 2)
  ).toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[8px] font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}18`,
        color,
        fontSize: size * 0.4,
        border: `1px solid ${color}2E`,
      }}
    >
      {initials || '?'}
    </span>
  );
}
