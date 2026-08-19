"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   Reliastra dashboard primitives — flat, precise, surgical.
   Colors per spec: base #0B0F19 · card #111827 · border #1F2937 · accent #3B82F6
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Formatting helpers ─────────────────────────────────────────────────── */

/** Relative time per spec: `2m ago`, `1h ago`, `14:32 UTC` if > 24h. */
export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  if (diffMs < 0) return "just now";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

export function fmtUptime(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return "—";
  return `${pct.toFixed(2)}%`;
}

export function fmtLatency(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  return ms < 10 ? ms.toFixed(1) : Math.round(ms).toString();
}

export function fmtDurationSeconds(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/* ── Status metadata ────────────────────────────────────────────────────── */

export type StatusKey = "operational" | "degraded" | "down" | "unknown" | "up";

export interface StatusMeta {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  pulse?: "slow" | "fast";
}

export function statusMeta(status: string | null | undefined): StatusMeta {
  const s = (status || "unknown").toLowerCase();
  const key: StatusKey =
    s === "up" || s === "operational"
      ? "operational"
      : s === "degraded"
        ? "degraded"
        : s === "down"
          ? "down"
          : "unknown";

  switch (key) {
    case "operational":
      return {
        label: "Operational",
        text: "#22C55E",
        bg: "rgba(34,197,94,0.1)",
        border: "rgba(34,197,94,0.2)",
        dot: "#22C55E",
      };
    case "degraded":
      return {
        label: "Degraded",
        text: "#F59E0B",
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.2)",
        dot: "#F59E0B",
        pulse: "slow",
      };
    case "down":
      return {
        label: "Down",
        text: "#EF4444",
        bg: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.2)",
        dot: "#EF4444",
        pulse: "fast",
      };
    default:
      return {
        label: "Unknown",
        text: "#6B7280",
        bg: "rgba(107,114,128,0.1)",
        border: "rgba(107,114,128,0.2)",
        dot: "#6B7280",
      };
  }
}

/* ── Severity metadata ──────────────────────────────────────────────────── */

export type SeverityKey = "critical" | "major" | "minor";

export function severityMeta(severity: string | null | undefined): { label: string; color: string } {
  switch ((severity || "minor").toLowerCase()) {
    case "critical":
      return { label: "Critical", color: "#EF4444" };
    case "major":
      return { label: "Major", color: "#F59E0B" };
    default:
      return { label: "Minor", color: "#6B7280" };
  }
}

/* ── Confidence tiers ───────────────────────────────────────────────────── */

export function confidenceMeta(pct: number | null | undefined): {
  label: "HIGH" | "MEDIUM" | "LOW" | "PENDING";
  color: string;
} {
  if (pct == null || Number.isNaN(pct)) return { label: "PENDING", color: "#6B7280" };
  if (pct > 80) return { label: "HIGH", color: "#22C55E" };
  if (pct >= 40) return { label: "MEDIUM", color: "#F59E0B" };
  return { label: "LOW", color: "#EF4444" };
}

export function confidenceColor(pct: number | null | undefined): string {
  return confidenceMeta(pct).color;
}

/* ═══════════════════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Card ───────────────────────────────────────────────────────────────── */

export function Card({
  className,
  hover = false,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "bg-[#111827] border border-[#1F2937] rounded-xl",
        hover && "transition-[border-color] duration-150 ease-in-out hover:border-[#374151]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Status pill badge ──────────────────────────────────────────────────── */

export function StatusPill({ status, className }: { status: string | null | undefined; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.pulse === "slow" && "rs-pulse",
        meta.pulse === "fast" && "rs-pulse-fast",
        className
      )}
      style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  );
}

/* ── Status dot (8px) ───────────────────────────────────────────────────── */

export function StatusDot({ status, className }: { status: string | null | undefined; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        meta.pulse === "slow" && "rs-pulse",
        meta.pulse === "fast" && "rs-pulse-fast",
        className
      )}
      style={{ width: 8, height: 8, backgroundColor: meta.dot }}
    />
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("rs-skeleton", className)} style={style} aria-hidden="true" />;
}

export function SkeletonLine({ width, className }: { width: string | number; className?: string }) {
  return <Skeleton className={cn("h-3", className)} style={{ width }} />;
}

/* ── Empty state ────────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-20">
      <Icon className="w-12 h-12 text-[#374151] mx-auto mb-4" strokeWidth={1.5} />
      <h3 className="text-base font-medium text-[#9CA3AF]">{title}</h3>
      <p className="text-sm text-[#6B7280] mt-1">{body}</p>
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center mt-4 bg-[#3B82F6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-[filter]"
          >
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center mt-4 bg-[#3B82F6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-[filter]"
          >
            {actionLabel}
          </button>
        ) : null)}
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────────────── */

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#F9FAFB]">{title}</h2>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ── Section link (View all →) ──────────────────────────────────────────── */

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-[#3B82F6] hover:underline">
      {children}
    </Link>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-4 py-2 transition-[filter,background-color,border-color] disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-[#3B82F6] text-white hover:brightness-110",
        variant === "ghost" &&
          "bg-transparent border border-[#374151] text-[#F9FAFB] hover:border-[#9CA3AF]",
        variant === "danger" && "bg-transparent border border-[#EF4444]/40 text-[#EF4444] hover:border-[#EF4444]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Page header ────────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#F9FAFB] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 flex items-center gap-3">{right}</div>}
    </div>
  );
}
