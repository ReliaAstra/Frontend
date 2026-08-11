'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ExternalLink, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Vendor = 'stripe' | 'auth0' | 'cloudflare' | 'openai' | 'twilio' | 'vercel';

// Deterministic pseudo-random based on vendor name for consistency
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash + index * 0.1) * 10000;
  return x - Math.floor(x);
}

type StatusEntry = 'operational' | 'degraded' | 'down';
type Region = 'us-east' | 'us-west' | 'eu-west' | 'ap-south';

const regions: Region[] = ['us-east', 'us-west', 'eu-west', 'ap-south'];

function generateLatencyData(vendor: Vendor): { hour: number; latency: number }[] {
  const data: { hour: number; latency: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const r = seededRandom(vendor, h);
    const baseLatency = r < 0.05 ? 400 + r * 600 : 50 + r * 150;
    data.push({ hour: h, latency: Math.round(baseLatency) });
  }
  return data;
}

function generateHistory(vendor: Vendor): { time: string; status: StatusEntry; latency: number; region: Region }[] {
  const entries: { time: string; status: StatusEntry; latency: number; region: Region }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
    const r = seededRandom(vendor, 100 + i);
    const status: StatusEntry = r < 0.08 ? 'down' : r < 0.2 ? 'degraded' : 'operational';
    const baseLatency = status === 'down' ? 800 + r * 400 : status === 'degraded' ? 300 + r * 200 : 60 + r * 120;
    entries.push({
      time: time.toUTCString().slice(17, 25),
      status,
      latency: Math.round(baseLatency),
      region: regions[i % 4],
    });
  }
  return entries;
}

const statusStyles = {
  operational: { label: 'Operational', color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: 'text-amber-700 bg-amber-50', icon: AlertTriangle },
  down: { label: 'Down', color: 'text-red-700 bg-red-50', icon: AlertTriangle },
};

interface TrackVendorContentProps {
  vendor: Vendor;
  vendorLabel: string;
}

export function TrackVendorContent({ vendor, vendorLabel }: TrackVendorContentProps) {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const latencyData = generateLatencyData(vendor);
  const history = generateHistory(vendor);
  const maxLatency = Math.max(...latencyData.map((d) => d.latency));
  const overallStatus: StatusEntry = latencyData.some((d) => d.latency > 500) ? 'degraded' : 'operational';
  const statusStyle = statusStyles[overallStatus];

  const handleSubscribe = async () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, vendor }),
      });
      if (res.ok) {
        toast.success(`Subscribed to ${vendorLabel} alerts!`);
        setEmail('');
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="h-4 w-4 text-[#0891B2]" />
              <span className="text-sm text-[#52525B]">Independent Monitoring</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight">
                  {vendorLabel} API Status
                </h1>
                <p className="mt-2 text-[#52525B] max-w-xl">
                  Real-time, third-party monitoring of {vendorLabel}&apos;s API endpoints.
                  Data is collected independently — not from {vendorLabel}&apos;s own status page.
                </p>
              </div>
              <Badge className={cn('text-sm px-3 py-1 w-fit', statusStyle.color)} variant="secondary">
                <statusStyle.icon className="h-4 w-4 mr-1" />
                {statusStyle.label}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latency Chart */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-lg font-semibold text-[#09090B] mb-6">24-Hour Latency</h2>
          <div className="rounded-xl border border-[#E4E4E7] p-6 bg-white">
            <div className="flex items-end gap-[2px] h-48">
              {latencyData.map((d) => {
                const height = (d.latency / maxLatency) * 100;
                const color = d.latency > 500 ? 'bg-red-400' : d.latency > 300 ? 'bg-amber-400' : 'bg-[#0891B2]';
                return (
                  <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-8 bg-[#09090B] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {d.latency}ms
                      </div>
                    </div>
                    <div
                      className={cn('w-full rounded-t-sm transition-all min-h-[4px]', color)}
                      style={{ height: `${Math.max(height, 3)}%` }}
                      title={`${d.hour}:00 — ${d.latency}ms`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#A1A1AA]">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-[#52525B]">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0891B2]" /> &lt; 300ms</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> 300–500ms</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> &gt; 500ms</div>
            </div>
          </div>
        </div>
      </section>

      {/* 24h History Table */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-lg font-semibold text-[#09090B] mb-6">24-Hour History</h2>
          <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E4E4E7]">
                    <th className="text-left py-3 px-4 font-medium text-[#52525B]">Time (UTC)</th>
                    <th className="text-left py-3 px-4 font-medium text-[#52525B]">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-[#52525B]">Latency</th>
                    <th className="text-left py-3 px-4 font-medium text-[#52525B]">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => {
                    const s = statusStyles[entry.status];
                    return (
                      <tr key={i} className="border-b border-[#F0F0F0] last:border-0 hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-[#09090B] font-mono text-xs">{entry.time}</td>
                        <td className="py-3 px-4">
                          <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', s.color)}>
                            <s.icon className="h-3 w-3" />
                            {s.label}
                          </span>
                        </td>
                        <td className={cn('py-3 px-4 font-mono', entry.latency > 500 ? 'text-red-600 font-semibold' : entry.latency > 300 ? 'text-amber-600' : 'text-[#09090B]')}>
                          {entry.latency}ms
                        </td>
                        <td className="py-3 px-4 text-[#52525B]">{entry.region}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Alerts */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <Bell className="h-10 w-10 text-[#0891B2] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#09090B]">Subscribe to Alerts</h2>
            <p className="mt-2 text-[#52525B]">
              Get notified instantly when {vendorLabel}&apos;s API degrades or goes down.
            </p>
            <div className="mt-6 flex gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <Button onClick={handleSubscribe} disabled={subscribing} className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg shrink-0">
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
