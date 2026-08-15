"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IncidentDetail } from "@/components/dashboard/IncidentDetail";
import { incidentService, type IncidentDetail as IncidentDetailType, type TimelineEvent, type CorrelatedSignal, buildTimeline, buildCorrelatedSignals } from "@/services/incidentService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<IncidentDetailType | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [signals, setSignals] = useState<CorrelatedSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    incidentService.getById(id).then((inc) => {
      setIncident(inc);
      setTimeline(buildTimeline(inc));
      setSignals(buildCorrelatedSignals(inc));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const handleStatusUpdate = async (status: "open" | "resolved" | "false_positive") => {
    setStatusUpdating(true);
    try {
      await incidentService.update(id, { status });
      if (incident) setIncident({ ...incident, status });
      toast.success(`Incident marked as ${status.replace("_", " ")}.`);
    } catch {
      toast.error("Incident could not be updated.");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] rounded-lg bg-white" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Skeleton className="h-[300px] rounded-lg bg-white" />
          <Skeleton className="h-[300px] rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Incident not found.</p>
        <Button variant="ghost" onClick={() => router.push("/incidents")} className="mt-4 text-[#52525B]">
          Back to Incidents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/incidents")}
        className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Incidents
      </button>
      <IncidentDetail
        incident={incident}
        timeline={timeline}
        signals={signals}
        onStatusUpdate={handleStatusUpdate}
        statusUpdating={statusUpdating}
      />
    </div>
  );
}
