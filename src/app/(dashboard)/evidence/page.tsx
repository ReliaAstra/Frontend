"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSearch, ArrowRight } from "lucide-react";
import Link from "next/link";
import { evidenceService } from "@/services/evidenceService";

interface EvidenceItem {
  id: string;
  incident_id: string | null;
  created_at: string;
  status_code: number | null;
}

export default function EvidenceIndexPage() {
  const { isLoading: authLoading } = useAuth();
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    setError(null);
    evidenceService
      .list()
      .then((data) => setEvidence(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Unable to load evidence records.");
        setEvidence([]);
      })
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">
          EVIDENCE
        </h1>
        <p className="text-[12px] text-[#A1A1AA] mt-1">
          Tamper-proof SLA evidence reports for vendor incidents
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px] bg-[#F8F9FA]" />
            ))}
          </div>
        </div>
      ) : evidence.length > 0 ? (
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E4E4E7]">
            <p className="text-[13px] font-semibold text-[#09090B]">Recent Evidence</p>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {evidence.map((item) => (
              <Link
                key={item.id}
                href={`/evidence/${item.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0891B2]/8">
                  <FileSearch className="h-4 w-4 text-[#0891B2]" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors font-mono">
                    {item.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#A1A1AA]">
                    {item.incident_id && (
                      <span className="font-mono">
                        INC-{item.incident_id.slice(0, 8)}
                      </span>
                    )}
                    <span>
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
          <FileSearch className="h-10 w-10 text-[#E4E4E7] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#09090B]">No evidence records yet</p>
          <p className="text-xs text-[#A1A1AA] mt-1.5 max-w-md mx-auto">
            Evidence reports are automatically generated when incidents are detected
            and correlated with your monitored dependencies.
          </p>
        </div>
      )}
    </div>
  );
}
