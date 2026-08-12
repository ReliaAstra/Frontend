"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IncidentDetail } from "@/components/dashboard/IncidentDetail";
import { incidentService, type Incident, type TimelineEvent, type CorrelatedSignal } from "@/services/incidentService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [signals, setSignals] = useState<CorrelatedSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      incidentService.getById(id),
      incidentService.getTimeline(id),
      incidentService.getCorrelatedSignals(id),
    ]).then(([inc, tl, sig]) => {
      setIncident(inc);
      setTimeline(tl);
      setSignals(sig);
      setLoading(false);
    });
  }, [id]);

  const handleStatusUpdate = async (status: "investigating" | "resolved") => {
    await incidentService.updateStatus(id, status);
    if (incident) setIncident({ ...incident, status });
    toast.success(`Incident marked as ${status}`);
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
        <p className="text-gray-400">Incident not found.</p>
        <Button variant="ghost" onClick={() => router.push("/incidents")} className="mt-4 text-gray-500">
          Back to Incidents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/incidents")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Incidents
      </button>
      <IncidentDetail incident={incident} timeline={timeline} signals={signals} />
    </div>
  );
}