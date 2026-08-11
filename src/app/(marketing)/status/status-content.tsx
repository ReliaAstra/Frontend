'use client';

import { cn } from '@/lib/utils';
import { Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

type StatusLevel = 'operational' | 'degraded' | 'down' | 'maintenance';

interface SystemComponent {
  name: string;
  status: StatusLevel;
  uptime: number;
}

interface Incident {
  date: string;
  component: string;
  status: 'resolved' | 'monitoring' | 'investigating';
  duration: string;
  summary: string;
}

const components: SystemComponent[] = [
  { name: 'API', status: 'operational', uptime: 99.98 },
  { name: 'Check Engine', status: 'operational', uptime: 99.95 },
  { name: 'Notification Delivery', status: 'degraded', uptime: 99.71 },
  { name: 'Dashboard', status: 'operational', uptime: 99.99 },
];

const incidents: Incident[] = [
  {
    date: 'Aug 10, 2025 14:32 UTC',
    component: 'Notification Delivery',
    status: 'monitoring',
    duration: '2h 18m',
    summary: 'Slack webhook deliveries experienced elevated latency. Email and webhook fallback routing engaged.',
  },
  {
    date: 'Aug 7, 2025 09:15 UTC',
    component: 'API',
    status: 'resolved',
    duration: '23m',
    summary: 'Brief spike in 5xx errors due to a rolling deployment. Automatic rollback resolved the issue.',
  },
  {
    date: 'Jul 29, 2025 22:00 UTC',
    component: 'Check Engine',
    status: 'resolved',
    duration: '47m',
    summary: 'Scheduled maintenance to upgrade monitoring infrastructure. All checks resumed normally.',
  },
  {
    date: 'Jul 21, 2025 11:45 UTC',
    component: 'Dashboard',
    status: 'resolved',
    duration: '12m',
    summary: 'Dashboard loading times degraded due to cache invalidation storm. Resolved by staggering cache refreshes.',
  },
  {
    date: 'Jul 15, 2025 03:10 UTC',
    component: 'Notification Delivery',
    status: 'resolved',
    duration: '1h 05m',
    summary: 'PagerDuty integration returned intermittent 503 errors. Root cause traced to upstream provider.',
  },
];

const statusConfig: Record<StatusLevel, { label: string; color: string; bg: string; dot: string; icon: typeof CheckCircle2 }> = {
  operational: { label: 'Operational', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400', icon: CheckCircle2 },
  degraded: { label: 'Degraded Performance', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400', icon: AlertTriangle },
  down: { label: 'Major Outage', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400', icon: AlertTriangle },
  maintenance: { label: 'Under Maintenance', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400', icon: Clock },
};

const incidentStatusConfig = {
  resolved: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-400/10' },
  monitoring: { label: 'Monitoring', color: 'text-amber-400 bg-amber-400/10' },
  investigating: { label: 'Investigating', color: 'text-red-400 bg-red-400/10' },
};

export function StatusContent() {
  const hasActiveIssue = components.some((c) => c.status !== 'operational');

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-[#0891B2]" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">System Status</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Real-time health of Reliastra&apos;s monitoring infrastructure.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 bg-white/5">
          <span className={cn('h-2.5 w-2.5 rounded-full', hasActiveIssue ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} />
          <span className={cn('text-sm font-medium', hasActiveIssue ? 'text-amber-400' : 'text-emerald-400')}>
            {hasActiveIssue ? 'Partial System Issue' : 'All Systems Operational'}
          </span>
        </div>
      </div>

      {/* System Components */}
      <section className="mb-16" aria-label="System components">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Components</h2>
        <div className="space-y-3">
          {components.map((comp) => {
            const config = statusConfig[comp.status];
            return (
              <div
                key={comp.name}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-4 md:p-5',
                  config.bg
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('h-3 w-3 rounded-full shrink-0', config.dot, comp.status === 'degraded' && 'animate-pulse')} />
                  <span className="text-white font-medium">{comp.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm hidden sm:inline">90-day uptime</span>
                  <span className={cn('text-sm font-semibold tabular-nums', config.color)}>
                    {comp.uptime.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Incident History */}
      <section aria-label="Incident history">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Incident History</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Component</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Duration</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Summary</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc, i) => {
                  const sConfig = incidentStatusConfig[inc.status];
                  return (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-300 whitespace-nowrap">{inc.date}</td>
                      <td className="py-3 px-4 text-white font-medium">{inc.component}</td>
                      <td className="py-3 px-4">
                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', sConfig.color)}>
                          {sConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{inc.duration}</td>
                      <td className="py-3 px-4 text-gray-400 max-w-xs truncate hidden lg:table-cell">{inc.summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 text-sm">
          Last updated: August 11, 2025 at 17:00 UTC &middot; Page refreshes every 60 seconds
        </p>
      </div>
    </div>
  );
}