"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import type { TimelineEvent } from "@/services/incidentService";

interface PrecisionTimelineProps {
  events: TimelineEvent[];
  incidentStart: string;
  incidentEnd: string | null;
}

const typeConfig: Record<string, { dot: string; ring: string; label: string; color: string }> = {
  status_change: { dot: "bg-blue-500", ring: "ring-blue-200", label: "STATUS", color: "text-blue-600" },
  acknowledged: { dot: "bg-amber-500", ring: "ring-amber-200", label: "ACK", color: "text-amber-600" },
  correlation: { dot: "bg-violet-500", ring: "ring-violet-200", label: "CORRELATION", color: "text-violet-600" },
  evidence_generated: { dot: "bg-emerald-500", ring: "ring-emerald-200", label: "EVIDENCE", color: "text-emerald-600" },
  threshold_breach: { dot: "bg-red-500", ring: "ring-red-200", label: "BREACH", color: "text-red-600" },
  resolved: { dot: "bg-emerald-500", ring: "ring-emerald-200", label: "RESOLVED", color: "text-emerald-600" },
  note: { dot: "bg-[#71717A]", ring: "ring-[#E4E4E7]", label: "NOTE", color: "text-[#52525B]" },
};

export function PrecisionTimeline({ events, incidentStart, incidentEnd }: PrecisionTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[#A1A1AA]">No timeline events recorded.</p>
        <p className="text-xs text-[#D4D4D8] mt-1">Events will appear as the incident progresses.</p>
      </div>
    );
  }

  const startMs = new Date(incidentStart).getTime();
  const endMs = incidentEnd ? new Date(incidentEnd).getTime() : Date.now();
  const totalDuration = endMs - startMs;

  return (
    <div className="space-y-0">
      {/* Time header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[10px] font-mono text-[#A1A1AA]">
          T+0:00:00
        </span>
        <span className="text-[10px] font-mono text-[#A1A1AA]">
          Duration: {formatDuration(totalDuration)}
        </span>
      </div>

      {/* Events */}
      {events.map((event, idx) => {
        const config = typeConfig[event.type] || typeConfig.note;
        const eventMs = new Date(event.timestamp).getTime();
        const offsetMs = eventMs - startMs;
        const offsetLabel = formatOffset(offsetMs);
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4 pb-5 last:pb-0">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-3.5 w-3.5 rounded-full shrink-0 ring-[3px]",
                config.dot,
                config.ring
              )} />
              {!isLast && (
                <div className="w-px flex-1 bg-[#E4E4E7] mt-1 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 -mt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-semibold tracking-wider", config.color)}>
                  {config.label}
                </span>
                <span className="text-[10px] font-mono text-[#A1A1AA]">T+{offsetLabel}</span>
              </div>
              <p className="text-[13px] font-medium text-[#09090B] mb-0.5">{event.action}</p>
              <p className="text-xs text-[#52525B] leading-relaxed">{event.details}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#A1A1AA]">
                <span>{event.actor}</span>
                <span className="text-[#E4E4E7]">·</span>
                <span>{format(new Date(event.timestamp), "MMM d, HH:mm:ss")}</span>
                <span className="text-[#E4E4E7]">·</span>
                <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatOffset(ms: number): string {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
  return `0:${String(s).padStart(2, "0")}`;
}
