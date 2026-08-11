'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

interface VendorData {
  name: string;
  baseLatency: number;
  color: string;
  status: 'up' | 'degraded' | 'down';
  latency: number;
  history: number[];
  uptime: number;
  /** probabilities for status transitions when currently 'up' */
  degradeChance: number;
  downChance: number;
}

const INITIAL_VENDORS: Omit<VendorData, 'status' | 'latency' | 'history' | 'uptime' | 'degradeChance' | 'downChance'>[] = [
  { name: 'Stripe', baseLatency: 120, color: '#635BFF' },
  { name: 'Auth0', baseLatency: 85, color: '#EB5424' },
  { name: 'Cloudflare', baseLatency: 15, color: '#F6821F' },
  { name: 'OpenAI', baseLatency: 350, color: '#10A37F' },
  { name: 'Twilio', baseLatency: 95, color: '#F22F46' },
  { name: 'Vercel', baseLatency: 45, color: '#000000' },
];

const STATUS_PROBS: Record<string, { degrade: number; down: number }> = {
  Stripe:    { degrade: 0.03, down: 0.02 },
  Auth0:     { degrade: 0.12, down: 0.08 },
  Cloudflare:{ degrade: 0.02, down: 0.01 },
  OpenAI:    { degrade: 0.08, down: 0.04 },
  Twilio:    { degrade: 0.05, down: 0.05 },
  Vercel:    { degrade: 0.04, down: 0.01 },
};

const HISTORY_LENGTH = 30;
const MOBILE_VENDOR_NAMES = ['Stripe', 'Auth0', 'OpenAI'];
const TICK_MS = 3000;

const ALERT_MESSAGES = [
  "Your service degradation correlates with Auth0 EU outage — 14:02 UTC",
  "Stripe API latency spike detected — correlating with your checkout failures",
  "Cloudflare CDN degradation matches your origin timeout pattern",
];

type VendorState = VendorData[];

function generateLatency(baseLatency: number, tickIndex: number): number {
  // Slow sine-wave drift (period ~20 points)
  const sine = Math.sin((tickIndex / 20) * Math.PI * 2) * baseLatency * 0.15;
  // Small random noise
  const noise = (Math.random() - 0.5) * baseLatency * 0.2;
  // Occasional sharp spikes (1 in 20 chance)
  const spike = Math.random() < 0.05 ? baseLatency * (1.5 + Math.random() * 2) : 0;
  return Math.max(1, baseLatency + sine + noise + spike);
}

function initVendors(): VendorState {
  let tickIdx = 0;
  return INITIAL_VENDORS.map((v) => {
    const history: number[] = [];
    for (let i = 0; i < HISTORY_LENGTH; i++) {
      history.push(Math.round(generateLatency(v.baseLatency, tickIdx++)));
    }
    const latency = history[history.length - 1];
    // Auth0 starts as degraded so user immediately sees amber
    const status: 'up' | 'degraded' | 'down' = v.name === 'Auth0' ? 'degraded' : 'up';
    const probs = STATUS_PROBS[v.name] || { degrade: 0.03, down: 0.02 };
    return {
      ...v,
      status,
      latency: status === 'degraded' ? Math.round(v.baseLatency * 2.2) : status === 'down' ? Math.round(v.baseLatency * 5) : latency,
      history: history.map((h) => Math.round(h)),
      uptime: 99.9 + Math.random() * 0.09,
      degradeChance: probs.degrade,
      downChance: probs.down,
    };
  });
}

function getControlPoints(points: { x: number; y: number }[]) {
  if (points.length < 2) return [];
  const cps: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    cps.push({ cp1x, cp1y, cp2x, cp2y });
  }
  return cps;
}

export function LiveVendorChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vendorsRef = useRef<VendorState>(initVendors());
  const rafRef = useRef<number>(0);
  const tickIndexRef = useRef<number>(HISTORY_LENGTH);
  const [, forceRender] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Alert banner interval
  useEffect(() => {
    let msgIdx = 0;
    const showNext = () => {
      setAlertMessage(ALERT_MESSAGES[msgIdx % ALERT_MESSAGES.length]);
      msgIdx++;
      setAlertVisible(true);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = setTimeout(() => setAlertVisible(false), 5000);
    };
    showNext();
    const interval = setInterval(showNext, 8000);
    return () => {
      clearInterval(interval);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    let vendors = vendorsRef.current;
    if (isMobile) {
      vendors = vendors.filter((v) => MOBILE_VENDOR_NAMES.includes(v.name));
    }
    const rowHeight = h / vendors.length;
    const sparklineWidth = Math.min(160, w * 0.35);
    const nameWidth = 80;
    const statusDotX = nameWidth + 12;
    const sparklineX = statusDotX + 20;
    const latencyX = sparklineX + sparklineWidth + 12;

    ctx.clearRect(0, 0, w, h);

    vendors.forEach((vendor, i) => {
      const y = i * rowHeight;
      const centerY = y + rowHeight / 2;

      // Vendor color circle
      ctx.beginPath();
      ctx.arc(14, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = vendor.color;
      ctx.fill();

      // Vendor name
      ctx.font = '500 13px var(--font-inter), sans-serif';
      ctx.fillStyle = '#09090B';
      ctx.textBaseline = 'middle';
      ctx.fillText(vendor.name, 26, centerY);

      // Status dot
      const statusColor =
        vendor.status === 'up'
          ? '#16A34A'
          : vendor.status === 'degraded'
          ? '#D97706'
          : '#DC2626';
      // Outer glow for degraded/down
      if (vendor.status !== 'up') {
        ctx.beginPath();
        ctx.arc(statusDotX, centerY, 7, 0, Math.PI * 2);
        ctx.fillStyle = statusColor + '30';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(statusDotX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.fill();

      // Sparkline with smooth bezier curves
      const history = vendor.history;
      if (history.length >= 2) {
        const slY = y + 8;
        const slH = rowHeight - 16;
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;
        const stepX = sparklineWidth / (history.length - 1);

        const points = history.map((val, j) => ({
          x: sparklineX + j * stepX,
          y: slY + slH - ((val - min) / range) * slH,
        }));

        const cps = getControlPoints(points);

        // Gradient fill
        const grad = ctx.createLinearGradient(0, slY, 0, slY + slH);
        grad.addColorStop(0, vendor.color + '14');
        grad.addColorStop(1, vendor.color + '00');
        ctx.beginPath();
        ctx.moveTo(points[0].x, slY + slH);
        ctx.lineTo(points[0].x, points[0].y);
        for (let j = 0; j < cps.length; j++) {
          ctx.bezierCurveTo(
            cps[j].cp1x, cps[j].cp1y,
            cps[j].cp2x, cps[j].cp2y,
            points[j + 1].x, points[j + 1].y
          );
        }
        ctx.lineTo(points[points.length - 1].x, slY + slH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 0; j < cps.length; j++) {
          ctx.bezierCurveTo(
            cps[j].cp1x, cps[j].cp1y,
            cps[j].cp2x, cps[j].cp2y,
            points[j + 1].x, points[j + 1].y
          );
        }
        ctx.strokeStyle = vendor.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Latency value
      ctx.font = '600 13px var(--font-inter), sans-serif';
      ctx.fillStyle =
        vendor.status === 'down'
          ? '#DC2626'
          : vendor.status === 'degraded'
          ? '#D97706'
          : '#52525B';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${vendor.latency}ms`, latencyX, centerY);

      // Status label
      if (vendor.status !== 'up') {
        const label = vendor.status === 'degraded' ? 'DEGRADED' : 'DOWN';
        ctx.font = '700 10px var(--font-inter), sans-serif';
        ctx.fillStyle =
          vendor.status === 'degraded' ? '#D97706' : '#DC2626';
        ctx.fillText(label, latencyX + 55, centerY);
      }

      // Separator line
      if (i < vendors.length - 1) {
        ctx.beginPath();
        ctx.moveTo(0, y + rowHeight);
        ctx.lineTo(w, y + rowHeight);
        ctx.strokeStyle = '#F0F0F0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [isMobile]);

  useEffect(() => {
    const updateData = () => {
      tickIndexRef.current++;
      vendorsRef.current = vendorsRef.current.map((v) => {
        let newStatus = v.status;
        const roll = Math.random();

        if (v.status === 'up') {
          if (roll < v.downChance) {
            newStatus = 'down';
          } else if (roll < v.downChance + v.degradeChance) {
            newStatus = 'degraded';
          }
        } else if (v.status === 'degraded') {
          if (Math.random() < 0.25) {
            newStatus = 'up';
          }
        } else if (v.status === 'down') {
          if (Math.random() < 0.15) {
            newStatus = 'up';
          }
        }

        let newLatency: number;
        if (newStatus === 'down') {
          newLatency = Math.round(v.baseLatency * (5 + Math.random() * 5));
        } else if (newStatus === 'degraded') {
          newLatency = Math.round(v.baseLatency * (2 + Math.random() * 2));
        } else {
          newLatency = Math.round(generateLatency(v.baseLatency, tickIndexRef.current));
        }

        const newHistory = [...v.history.slice(1), newLatency];
        return {
          ...v,
          latency: newLatency,
          status: newStatus,
          history: newHistory,
        };
      });
      forceRender((n) => n + 1);
    };

    const interval = setInterval(updateData, TICK_MS);

    const animate = () => {
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="relative w-full h-full">
      {/* Alert banner */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex justify-center transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: alertVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: alertVisible ? 1 : 0,
          pointerEvents: alertVisible ? 'auto' : 'none',
        }}
      >
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 mt-2 shadow-card">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse shrink-0" />
          {alertMessage}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: isMobile ? 180 : 320 }}
        aria-label="Live vendor monitoring chart showing latency for tracked vendors"
      />
    </div>
  );
}
