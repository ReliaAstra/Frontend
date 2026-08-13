"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { TimelineEvent } from "@/services/incidentService";

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

const typeStyles: Record<string, { dot: string; label: string }> = {
  status_change: { dot: "bg-blue-500", label: "Status" },
  acknowledged: { dot: "bg-amber-500", label: "Ack" },
  correlation: { dot: "bg-violet-500", label: "Correlation" },
  evidence_generated: { dot: "bg-emerald-500", label: "Evidence" },
  note: { dot: "bg-slate-400", label: "Note" },
  resolved: { dot: "bg-emerald-500", label: "Resolved" },
};

export function IncidentTimeline({ events }: IncidentTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-[#A1A1AA]">No timeline events.</p>;
  }

  return (
    <div className="relative space-y-0">
      {events.map((event, idx) => {
        const style = typeStyles[event.type] || typeStyles.note;
        return (
          <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={cn("h-3 w-3 rounded-full shrink-0 mt-1", style.dot)} />
              {idx < events.length - 1 && <div className="w-px flex-1 bg-[#E4E4E7] mt-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#09090B]">{event.action}</span>
                <span className="text-[10px] rounded bg-[#F8F9FA] px-1.5 py-0.5 text-[#52525B]">{style.label}</span>
              </div>
              <p className="text-xs text-[#52525B] mb-1">{event.details}</p>
              <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
                <span>{event.actor}</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
