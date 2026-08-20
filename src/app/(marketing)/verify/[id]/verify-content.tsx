'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, AlertTriangle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';

interface VerificationResult {
  found: boolean;
  error?: string;
  incident_id?: string;
  dependency_id?: string;
  org_id?: string;
  time_window?: { start: string; end: string };
  data_hash?: string;
  report_checksum?: string;
  methodology_version?: string;
  created_at?: string;
}

export function VerifyContent() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<VerificationResult>(`/verify/${id}`)
      .then((res) => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to verify this evidence. The verification service may be unavailable.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/track" className="text-[13px] text-[#A1A1AA] hover:text-[#0891B2] transition-colors">
            Vendors
          </Link>
          <span className="text-[#E4E4E7]">/</span>
          <span className="text-[13px] text-[#52525B] font-medium">Verification</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-[#0891B2]" />
          <h1 className="text-[24px] font-semibold text-[#09090B] tracking-[-0.02em]">
            Evidence Verification
          </h1>
        </div>
        <p className="text-sm text-[#52525B] mb-8">
          Cryptographic verification of Reliastra evidence snapshots.
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-8 text-center mb-6">
            <AlertCircle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#09090B]">{error}</p>
            <Link href="/track" className="mt-4 text-xs font-medium text-[#0891B2] hover:text-[#0E7490] transition-colors inline-block">
              Return to Vendor Intelligence
            </Link>
          </div>
        )}

        {/* Result */}
        {result && !error && (
          <>
            {/* Status */}
            <div className={`rounded-lg border p-6 mb-6 ${
              result.found
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-3">
                {result.found ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h2 className={`text-lg font-semibold ${result.found ? 'text-emerald-800' : 'text-red-800'}`}>
                    {result.found ? 'VERIFIED' : 'NOT FOUND'}
                  </h2>
                  <p className="text-sm text-[#52525B] mt-0.5">
                    {result.found
                      ? 'This evidence snapshot has been verified against the Reliastra ledger.'
                      : result.error || 'The specified evidence ID was not found in the Reliastra system.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            {result.found && (
              <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {result.incident_id && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] w-48">
                          Incident ID
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">{result.incident_id}</td>
                      </tr>
                    )}
                    {result.dependency_id && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Dependency ID
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">{result.dependency_id}</td>
                      </tr>
                    )}
                    {result.time_window && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Observation Window
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">
                          {format(new Date(result.time_window.start), 'MMM d, yyyy HH:mm')} UTC &mdash; {format(new Date(result.time_window.end), 'MMM d, yyyy HH:mm')} UTC
                        </td>
                      </tr>
                    )}
                    {result.data_hash && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Data Hash
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-[11px] break-all">sha256:{result.data_hash}</td>
                      </tr>
                    )}
                    {result.report_checksum && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Report Checksum
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-[11px] break-all">sha256:{result.report_checksum}</td>
                      </tr>
                    )}
                    {result.methodology_version && (
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Methodology Version
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">{result.methodology_version}</td>
                      </tr>
                    )}
                    {result.created_at && (
                      <tr>
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                          Created
                        </td>
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">{format(new Date(result.created_at), 'MMM d, yyyy HH:mm')} UTC</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Methodology note */}
            <div className="mt-8 pt-6 border-t border-[#E4E4E7]">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA] mb-2">
                About Verification
              </p>
              <p className="text-xs text-[#52525B] leading-relaxed max-w-2xl">
                Reliastra evidence snapshots are immutable records of observed infrastructure behavior.
                Each snapshot includes a SHA-256 data hash computed from the underlying observation data,
                ensuring that any modification to the evidence would be detectable. This verification page
                allows third parties to independently confirm the integrity of evidence without requiring
                a Reliastra account.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
