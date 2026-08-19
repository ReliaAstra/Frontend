'use client';

import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.25, 0.1, 0.25, 1] as const;

const ACCENT = '#0891B2';
const INK = '#09090B';
const MUTED = '#A1A1AA';
const LINE = '#E4E4E7';

function Frame({
  children,
  caption,
  viewBox,
  label,
}: {
  children: React.ReactNode;
  caption: string;
  viewBox: string;
  label: string;
}) {
  return (
    <figure className="my-9 overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-[#FCFCFD]">
      <div className="overflow-x-auto p-6 sm:p-8">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={label}
          className="mx-auto h-auto w-full"
          style={{ minWidth: 520, maxWidth: 720 }}
        >
          {children}
        </svg>
      </div>
      <figcaption className="border-t border-[#F0F0F0] bg-white px-6 py-3 text-[12px] leading-relaxed text-[#71717A]">
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── Multi-region correlation ────────────────────────────────────────────── */

export function CorrelationDiagram() {
  const reduce = useReducedMotion();

  const regions = [
    { id: 'us-east-1', y: 46, failed: true },
    { id: 'eu-west-1', y: 130, failed: true },
    { id: 'ap-southeast-1', y: 214, failed: false },
  ];

  return (
    <Frame
      viewBox="0 0 720 280"
      label="Three observation regions checking one vendor endpoint. Two regions record failures and one records success, producing a partial-outage verdict."
      caption="Three independent observers, one endpoint. Two regions recording failures while a third succeeds points to a partial or regional failure — not a full provider outage, and not a local network fault."
    >
      {/* Observer column label */}
      <text x="12" y="22" fill={MUTED} fontSize="11" fontWeight="600" letterSpacing="1.2">
        OBSERVERS
      </text>
      <text x="300" y="22" fill={MUTED} fontSize="11" fontWeight="600" letterSpacing="1.2">
        TARGET
      </text>
      <text x="530" y="22" fill={MUTED} fontSize="11" fontWeight="600" letterSpacing="1.2">
        VERDICT
      </text>

      {/* Region nodes */}
      {regions.map((r, i) => (
        <g key={r.id}>
          <motion.g
            initial={reduce ? undefined : { opacity: 0, x: -14 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12, ease }}
          >
            <rect
              x="12"
              y={r.y}
              width="150"
              height="46"
              rx="10"
              fill="#FFFFFF"
              stroke={LINE}
              strokeWidth="1.5"
            />
            <circle cx="34" cy={r.y + 23} r="5" fill={r.failed ? '#DC2626' : '#16A34A'} />
            <text x="50" y={r.y + 21} fill={INK} fontSize="13" fontWeight="600">
              {r.id}
            </text>
            <text x="50" y={r.y + 36} fill={MUTED} fontSize="11" fontFamily="monospace">
              {r.failed ? '503 timeout' : '200 · 191ms'}
            </text>
          </motion.g>

          {/* Connection line */}
          <motion.path
            d={`M 162 ${r.y + 23} C 220 ${r.y + 23}, 240 140, 300 140`}
            fill="none"
            stroke={r.failed ? '#DC2626' : '#16A34A'}
            strokeWidth="2"
            strokeDasharray={r.failed ? '5 4' : undefined}
            opacity={0.55}
            initial={reduce ? undefined : { pathLength: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease }}
          />
        </g>
      ))}

      {/* Target */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
        whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        style={{ transformOrigin: '360px 140px' }}
      >
        <rect
          x="300"
          y="112"
          width="130"
          height="56"
          rx="12"
          fill="#FFFFFF"
          stroke={ACCENT}
          strokeWidth="2"
        />
        <text x="365" y="136" fill={INK} fontSize="13" fontWeight="700" textAnchor="middle">
          Vendor API
        </text>
        <text
          x="365"
          y="153"
          fill={MUTED}
          fontSize="11"
          fontFamily="monospace"
          textAnchor="middle"
        >
          /v1/endpoint
        </text>
      </motion.g>

      {/* Arrow to verdict */}
      <motion.path
        d="M 436 140 L 516 140"
        stroke={LINE}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.8, ease }}
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill={LINE} />
        </marker>
      </defs>

      {/* Verdict */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, x: 14 }}
        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.9, ease }}
      >
        <rect
          x="524"
          y="104"
          width="184"
          height="72"
          rx="12"
          fill="rgba(217,119,6,0.07)"
          stroke="rgba(217,119,6,0.35)"
          strokeWidth="1.5"
        />
        <text x="616" y="130" fill="#B45309" fontSize="13" fontWeight="700" textAnchor="middle">
          Partial outage
        </text>
        <text x="616" y="149" fill={MUTED} fontSize="11" textAnchor="middle">
          2 of 3 regions failing
        </text>
        <text x="616" y="164" fill={MUTED} fontSize="11" textAnchor="middle">
          not a local fault
        </text>
      </motion.g>
    </Frame>
  );
}

/* ── Observation chain ───────────────────────────────────────────────────── */

export function ObservationDiagram() {
  const reduce = useReducedMotion();

  const nodes = [
    { x: 20, label: 'Your stack', sub: 'affected by the outage', tone: 'muted' },
    { x: 260, label: 'Reliastra probes', sub: 'independent origin', tone: 'accent' },
    { x: 500, label: 'Vendor API', sub: 'the subject', tone: 'muted' },
  ];

  return (
    <Frame
      viewBox="0 0 720 210"
      label="Reliastra probes sit outside both your infrastructure and the vendor's, producing an observation record neither party controls."
      caption="The observer sits outside both parties. That is what makes the resulting record difficult for either side to attribute to the other's infrastructure."
    >
      {nodes.map((n, i) => {
        const accent = n.tone === 'accent';
        return (
          <motion.g
            key={n.label}
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.14, ease }}
          >
            <rect
              x={n.x}
              y="52"
              width="200"
              height="66"
              rx="12"
              fill={accent ? 'rgba(8,145,178,0.06)' : '#FFFFFF'}
              stroke={accent ? ACCENT : LINE}
              strokeWidth={accent ? 2 : 1.5}
            />
            <text
              x={n.x + 100}
              y="82"
              fill={INK}
              fontSize="14"
              fontWeight="700"
              textAnchor="middle"
            >
              {n.label}
            </text>
            <text x={n.x + 100} y="101" fill={MUTED} fontSize="11.5" textAnchor="middle">
              {n.sub}
            </text>
          </motion.g>
        );
      })}

      {/* Probe arrows */}
      <motion.path
        d="M 360 118 C 360 150, 200 150, 130 130"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeDasharray="5 4"
        opacity="0.5"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5, ease }}
      />
      <motion.path
        d="M 460 85 L 494 85"
        stroke={ACCENT}
        strokeWidth="2.5"
        markerEnd="url(#arrow-accent)"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.55, ease }}
      />
      <defs>
        <marker id="arrow-accent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={ACCENT} />
        </marker>
      </defs>

      <text x="360" y="168" fill={MUTED} fontSize="11.5" textAnchor="middle">
        scheduled checks · timestamped · region recorded
      </text>
      <text x="130" y="150" fill={MUTED} fontSize="11" textAnchor="middle">
        correlated to your incidents
      </text>
    </Frame>
  );
}

/* ── Claim flow ──────────────────────────────────────────────────────────── */

export function ClaimFlowDiagram() {
  const reduce = useReducedMotion();

  const steps = [
    { label: 'Observe', sub: 'per-interval record' },
    { label: 'Calculate', sub: 'monthly uptime %' },
    { label: 'Submit', sub: 'within 30 days' },
    { label: 'Credit', sub: 'applied to next bill' },
  ];

  const width = 156;
  const gap = 32;

  return (
    <Frame
      viewBox="0 0 720 160"
      label="The four stages of an SLA credit claim: observe, calculate, submit within the deadline, and receive the credit."
      caption="The deadline sits between stages three and four. Miss it and the entitlement is forfeited no matter how strong the record is."
    >
      {steps.map((s, i) => {
        const x = 12 + i * (width + gap);
        return (
          <g key={s.label}>
            <motion.g
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12, ease }}
            >
              <rect
                x={x}
                y="40"
                width={width}
                height="72"
                rx="12"
                fill="#FFFFFF"
                stroke={i === 3 ? ACCENT : LINE}
                strokeWidth={i === 3 ? 2 : 1.5}
              />
              <circle cx={x + 26} cy="66" r="12" fill="rgba(8,145,178,0.10)" />
              <text
                x={x + 26}
                y="70"
                fill={ACCENT}
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
              >
                {i + 1}
              </text>
              <text x={x + 46} y="70" fill={INK} fontSize="14" fontWeight="700">
                {s.label}
              </text>
              <text x={x + 20} y="94" fill={MUTED} fontSize="11">
                {s.sub}
              </text>
            </motion.g>

            {i < steps.length - 1 && (
              <motion.path
                d={`M ${x + width + 6} 76 L ${x + width + gap - 8} 76`}
                stroke={LINE}
                strokeWidth="2"
                markerEnd="url(#arrow-flow)"
                initial={reduce ? undefined : { pathLength: 0 }}
                whileInView={reduce ? undefined : { pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.12, ease }}
              />
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrow-flow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={LINE} />
        </marker>
      </defs>

      <text x="482" y="134" fill="#B45309" fontSize="11" fontWeight="600" textAnchor="middle">
        ← claim deadline applies here
      </text>
    </Frame>
  );
}

export function Diagram({ name }: { name: 'correlation' | 'claim-flow' | 'observation' }) {
  if (name === 'correlation') return <CorrelationDiagram />;
  if (name === 'claim-flow') return <ClaimFlowDiagram />;
  return <ObservationDiagram />;
}
