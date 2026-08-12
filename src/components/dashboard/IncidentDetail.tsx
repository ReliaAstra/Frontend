"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SeverityBadge } from "./SeverityBadge";
import { IncidentTimeline } from "./IncidentTimeline";
import { format } from "date-fns";
import { Link2, User, Globe, Zap } from "lucide-react";
import type { Incident, TimelineEvent, CorrelatedSignal } from "@/services/incidentService";

interface IncidentDetailProps {
  incident: Incident;
  timeline: TimelineEvent[];
  signals: CorrelatedSignal[];
}

const statusSteps = ["open", "investigating", "monitoring", "resolved"] as const;
const statusLabels: Record<string, string> = { open: "Open", investigating: "Investigating", monitoring: "Monitoring", resolved: "Resolved" };

export function IncidentDetail({ incident, timeline, signals }: IncidentDetailProps) {
  const currentStep = statusSteps.indexOf(incident.status);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SeverityBadge severity={incident.severity} />
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {statusLabels[incident.status]}
          </span>
          <span className="text-xs text-gray-400 font-mono ml-auto">{incident.id}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{incident.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>Started: {format(new Date(incident.started_at), "MMM d, yyyy HH:mm")}</span>
          {incident.resolved_at && (
            <span>Resolved: {format(new Date(incident.resolved_at), "MMM d, yyyy HH:mm")}</span>
          )}
        </div>

        {/* Status Pipeline */}
        <div className="flex items-center gap-0 mt-6">
          {statusSteps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors " +
                    (idx <= currentStep
                      ? "bg-[#6366F1] border-[#6366F1] text-white"
                      : "bg-transparent border-gray-200 text-gray-400")
                  }
                >
                  {idx < currentStep ? ("done" as string) : (idx + 1)}
                </div>
                <span className={"text-[10px] mt-1.5 " + (idx <= currentStep ? "text-gray-900" : "text-gray-400")}>
                  {statusLabels[step]}
                </span>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={"h-0.5 w-12 sm:w-20 mx-1 mb-4 " + (idx < currentStep ? "bg-[#6366F1]" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Description</h3>
        <div className="prose prose-sm max-w-none text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
          {incident.description}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">Timeline</h3>
            <IncidentTimeline events={timeline} />
          </div>

          {/* Correlated Signals */}
          {signals.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">Correlated Signals</h3>
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{signal.name}</span>
                      <span className="text-xs text-gray-500">{(signal.correlation * 100).toFixed(0)}% corr.</span>
                    </div>
                    <div className="h-[50px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={signal.values.map((v) => ({ v }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <XAxis dataKey="v" hide />
                          <YAxis hide />
                          <Line type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">{signal.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Service:</span>
                <span className="text-gray-900 font-medium">{incident.dependency_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Region:</span>
                <span className="text-gray-900 font-medium capitalize">{incident.region.replace(/_/g, " ")}</span>
              </div>
              {incident.assignee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Assignee:</span>
                  <span className="text-gray-900 font-medium">{incident.assignee}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-500">Impact:</span>
                <span className="text-gray-900 font-medium">{incident.impact}</span>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">Evidence Reports</h3>
            {timeline.some((e) => e.type === "evidence_generated") ? (
              <div className="space-y-2">
                {timeline.filter((e) => e.type === "evidence_generated").map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <p className="text-xs font-medium text-gray-900">SLA Evidence Report</p>
                      <p className="text-[10px] text-gray-400">Generated {format(new Date(e.timestamp), "MMM d, HH:mm")}</p>
                    </div>
                    <button className="text-xs text-blue-600 hover:underline">Download</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No evidence reports generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
