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
}

const INITIAL_VENDORS: Omit<VendorData, 'status' | 'latency' | 'history' | 'uptime'>[] = [
  { name: 'Stripe', baseLatency: 120, color: '#635BFF' },
  { name: 'Auth0', baseLatency: 85, color: '#EB5424' },
  { name: 'Cloudflare', baseLatency: 15, color: '#F6821F' },
  { name: 'OpenAI', baseLatency: 350, color: '#10A37F' },
  { name: 'Twilio', baseLatency: 95, color: '#F22F46' },
  { name: 'Vercel', baseLatency: 45, color: '#000000' },
];

const HISTORY_LENGTH = 30;

type VendorState = VendorData[];

function initVendors(): VendorState {
  return INITIAL_VENDORS.map((v) => {
    const history: number[] = [];
    for (let i = 0; i < HISTORY_LENGTH; i++) {
      history.push(v.baseLatency + (Math.random() - 0.5) * v.baseLatency * 0.3);
    }
    const latency = history[history.length - 1];
    return {
      ...v,
      status: 'up',
      latency: Math.round(latency),
      history: history.map((h) => Math.round(h)),
      uptime: 99.9 + Math.random() * 0.09,
    };
  });
}

export function LiveVendorChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vendorsRef = useRef<VendorState>(initVendors());
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const [, forceRender] = useState(0);

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
    const vendors = vendorsRef.current;
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
      ctx.beginPath();
      ctx.arc(statusDotX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.fill();

      // Sparkline
      const history = vendor.history;
      if (history.length >= 2) {
        const slY = y + 8;
        const slH = rowHeight - 16;
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;
        const stepX = sparklineWidth / (history.length - 1);

        // Fill
        const grad = ctx.createLinearGradient(0, slY, 0, slY + slH);
        grad.addColorStop(0, vendor.color + '18');
        grad.addColorStop(1, vendor.color + '00');
        ctx.beginPath();
        ctx.moveTo(sparklineX, slY + slH);
        history.forEach((val, j) => {
          const px = sparklineX + j * stepX;
          const py = slY + slH - ((val - min) / range) * slH;
          ctx.lineTo(px, py);
        });
        ctx.lineTo(sparklineX + sparklineWidth, slY + slH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        history.forEach((val, j) => {
          const px = sparklineX + j * stepX;
          const py = slY + slH - ((val - min) / range) * slH;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
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
  }, []);

  useEffect(() => {
    const updateData = () => {
      vendorsRef.current = vendorsRef.current.map((v) => {
        const jitter = (Math.random() - 0.5) * v.baseLatency * 0.3;
        let newLatency = Math.round(v.baseLatency + jitter);
        let newStatus = v.status as 'up' | 'degraded' | 'down';

        // Random degraded event (~every 8s per vendor, ~0.25% chance per 2s tick)
        if (Math.random() < 0.004) {
          newStatus = 'degraded';
          newLatency = Math.round(v.baseLatency * (2 + Math.random() * 2));
        }
        // Random down event (~every 15s per vendor, ~0.2% chance per 2s tick)
        if (Math.random() < 0.002) {
          newStatus = 'down';
          newLatency = Math.round(v.baseLatency * (5 + Math.random() * 5));
        }
        // Recovery (if degraded, 30% chance to recover; if down, 20% chance)
        if (v.status === 'degraded' && Math.random() < 0.3) newStatus = 'up';
        if (v.status === 'down' && Math.random() < 0.2) newStatus = 'up';
        if (newStatus === 'up') {
          newLatency = Math.round(v.baseLatency + (Math.random() - 0.5) * v.baseLatency * 0.3);
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

    const interval = setInterval(updateData, 2000);

    const animate = (time: number) => {
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
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: 320 }}
      aria-label="Live vendor monitoring chart showing latency for Stripe, Auth0, Cloudflare, OpenAI, Twilio, and Vercel"
    />
  );
}