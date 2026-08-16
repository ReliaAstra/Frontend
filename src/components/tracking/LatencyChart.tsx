'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChartPoint {
  hour: string;
  latency: number;
  p95: number;
}

interface TooltipData {
  x: number;
  y: number;
  latency: number;
  p95: number;
  hour: string;
}

interface Props {
  data: ChartPoint[];
  height?: number;
  onHover?: (point: TooltipData | null) => void;
}

// Catmull-Rom → Bezier control points for smooth curves
function getControlPoints(points: { x: number; y: number }[]) {
  if (points.length < 2) return [];
  const cps: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];
    cps.push({
      cp1x: p1.x + (p2.x - p0.x) / 6,
      cp1y: p1.y + (p2.y - p0.y) / 6,
      cp2x: p2.x - (p3.x - p1.x) / 6,
      cp2y: p2.y - (p3.y - p1.y) / 6,
    });
  }
  return cps;
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  cps: ReturnType<typeof getControlPoints>,
) {
  ctx.moveTo(points[0].x, points[0].y);
  for (let j = 0; j < cps.length; j++) {
    ctx.bezierCurveTo(cps[j].cp1x, cps[j].cp1y, cps[j].cp2x, cps[j].cp2y, points[j + 1].x, points[j + 1].y);
  }
}

export function LatencyChart({ data, height = 300, onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hoverPoint, setHoverPoint] = useState<TooltipData | null>(null);
  const animProgressRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const hasData = data.length > 0 && data.some(d => d.latency > 0 || d.p95 > 0);

  // Responsive container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = containerWidth;
  const padding = { top: 20, right: 12, bottom: 30, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute Y scale
  const { maxVal, yScale, yTicks } = useMemo(() => {
    if (!hasData) {
      return { maxVal: 100, yScale: (v: number) => v, yTicks: [0, 25, 50, 75, 100] };
    }
    const max = Math.max(...data.map(d => Math.max(d.latency, d.p95)), 10);
    const maxVal = Math.ceil(max / 50) * 50 || 100;
    const yScale = (v: number) => padding.top + chartH - (v / maxVal) * chartH;
    const step = maxVal / 4;
    const yTicks = [0, step, step * 2, step * 3, maxVal].map(v => Math.round(v));
    return { maxVal, yScale, yTicks };
  }, [data, hasData, chartH]);

  // X positions
  const xPositions = useMemo(() => {
    if (data.length === 0) return [];
    const step = chartW / (data.length - 1);
    return data.map((_, i) => padding.left + i * step);
  }, [data, chartW]);

  // Map data to canvas points
  const latencyPoints = useMemo(() => {
    return data.map((d, i) => ({ x: xPositions[i], y: yScale(d.latency) }));
  }, [data, xPositions, yScale]);

  const p95Points = useMemo(() => {
    return data.map((d, i) => ({ x: xPositions[i], y: yScale(d.p95) }));
  }, [data, xPositions, yScale]);

  const latencyCps = useMemo(() => getControlPoints(latencyPoints), [latencyPoints]);
  const p95Cps = useMemo(() => getControlPoints(p95Points), [p95Points]);

  // Handle hover
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !hasData || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left);
    const idx = Math.round((mx - padding.left) / chartW * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      const d = data[idx];
      const point: TooltipData = {
        x: xPositions[idx],
        y: yScale(d.latency),
        latency: d.latency,
        p95: d.p95,
        hour: d.hour,
      };
      setHoverPoint(point);
      onHover?.(point);
    }
  }, [data, xPositions, yScale, hasData, chartW, onHover]);

  const handleMouseLeave = useCallback(() => {
    setHoverPoint(null);
    onHover?.(null);
  }, [onHover]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Draw animation
    if (!prefersReduced) {
      const animate = () => {
        animProgressRef.current = Math.min(animProgressRef.current + 0.02, 1);
        const progress = animProgressRef.current;
        draw(ctx, progress);
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      };
      animProgressRef.current = 0;
      cancelAnimationFrame(animFrameRef.current);
      animate();
    } else {
      animProgressRef.current = 1;
      draw(ctx, 1);
    }

    function draw(ctx: CanvasRenderingContext2D, progress: number) {
      ctx.clearRect(0, 0, width, height);

      // Grid lines (horizontal, dashed)
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      yTicks.forEach(val => {
        const y = yScale(val);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      });
      ctx.restore();

      // Y-axis labels
      ctx.fillStyle = '#52525B';
      ctx.font = '11px "IBM Plex Mono", "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      yTicks.forEach(val => {
        ctx.fillText(`${val}`, padding.left - 8, yScale(val));
      });

      // X-axis labels
      if (data.length > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#52525B';
        const step = Math.max(Math.floor(data.length / 6), 1);
        for (let i = 0; i < data.length; i += step) {
          ctx.fillText(data[i].hour, xPositions[i], height - padding.bottom + 10);
        }
        // Always show last
        if ((data.length - 1) % step !== 0) {
          ctx.fillText(data[data.length - 1].hour, xPositions[xPositions.length - 1], height - padding.bottom + 10);
        }
      }

      if (!hasData || data.length < 2) return;

      // Clipping for animation
      ctx.save();
      const clipWidth = padding.left + chartW * progress;
      ctx.beginPath();
      ctx.rect(0, 0, clipWidth, height);
      ctx.clip();

      // P95 line (dashed, muted)
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      drawLine(ctx, p95Points, p95Cps);
      ctx.stroke();
      ctx.restore();

      // Median gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(8,145,178,0.06)');
      gradient.addColorStop(1, 'rgba(8,145,178,0)');
      ctx.beginPath();
      ctx.moveTo(latencyPoints[0].x, height - padding.bottom);
      ctx.lineTo(latencyPoints[0].x, latencyPoints[0].y);
      const fillCps = getControlPoints(latencyPoints);
      for (let j = 0; j < fillCps.length; j++) {
        ctx.bezierCurveTo(fillCps[j].cp1x, fillCps[j].cp1y, fillCps[j].cp2x, fillCps[j].cp2y, latencyPoints[j + 1].x, latencyPoints[j + 1].y);
      }
      ctx.lineTo(latencyPoints[latencyPoints.length - 1].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Median line (cyan, solid)
      ctx.strokeStyle = '#0891B2';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      drawLine(ctx, latencyPoints, latencyCps);
      ctx.stroke();

      ctx.restore(); // clip
    }
  }, [width, height, data, hasData, latencyPoints, p95Points, latencyCps, p95Cps, xPositions, yScale, yTicks]);

  // Cleanup animation frame
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="block"
        aria-label="Latency area chart"
        role="img"
      />
      {/* Hover crosshair */}
      {hoverPoint && hasData && (
        <>
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: hoverPoint.x,
              width: 1,
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          {/* Dots on lines */}
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-[#0891B2] border-2 border-[#131318] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: hoverPoint.x, top: hoverPoint.y }}
          />
        </>
      )}
      {/* Tooltip */}
      {hoverPoint && hasData && (
        <div
          className="absolute pointer-events-none bg-[#1A1A20] border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2 shadow-xl z-10"
          style={{
            left: Math.min(hoverPoint.x + 12, width - 180),
            top: hoverPoint.y - 60,
          }}
        >
          <p className="text-[11px] text-[#52525B] font-mono">{hoverPoint.hour}</p>
          <p className="text-xs text-[#FAFAFA] font-mono mt-0.5">Median: {hoverPoint.latency}ms</p>
          <p className="text-xs text-[#A1A1AA] font-mono">P95: {hoverPoint.p95}ms</p>
        </div>
      )}
      {/* Empty state overlay */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[#131318] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="text-xs text-[#52525B] font-medium">Monitoring active</span>
          </div>
        </div>
      )}
    </div>
  );
}
