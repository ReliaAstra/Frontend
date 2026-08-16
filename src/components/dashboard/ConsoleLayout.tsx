"use client";

import { cn } from "@/lib/utils";

export function ConsolePageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadeIn_200ms_ease-out]">
      {children}
    </div>
  );
}

export function ConsoleCard({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] shadow-console-card",
        hover && "hover:border-[rgba(255,255,255,0.12)] transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ConsoleCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-5 py-3 border-b border-[rgba(255,255,255,0.05)]", className)}>
      {children}
    </div>
  );
}

export function ConsoleCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function ConsoleTableHeader({
  columns,
}: {
  columns: { label: string; className?: string }[];
}) {
  return (
    <div className="px-5 py-3 grid gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
      {columns.map((col) => (
        <div key={col.label} className={col.className}>
          {col.label}
        </div>
      ))}
    </div>
  );
}

export function ConsoleTableRow({
  children,
  className,
  style,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
}) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 grid gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center",
        className
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatusDot({
  status,
  pulse = false,
}: {
  status: "operational" | "degraded" | "down" | "unknown";
  pulse?: boolean;
}) {
  const colors = {
    operational: "#16A34A",
    degraded: "#D97706",
    down: "#DC2626",
    unknown: "#52525B",
  };

  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        pulse && status === "down" && "animate-pulse-dot"
      )}
      style={{ backgroundColor: colors[status] }}
    />
  );
}

export function MetricValue({
  value,
  color,
  className,
}: {
  value: string | number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("font-mono text-2xl font-semibold text-[#FAFAFA]", className)}
      style={color ? { color } : undefined}
    >
      {value}
    </span>
  );
}

export function MonoSmall({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs text-[#A1A1AA]", className)}>
      {children}
    </span>
  );
}

// Add the fadeIn keyframes
export const fadeInKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`;
