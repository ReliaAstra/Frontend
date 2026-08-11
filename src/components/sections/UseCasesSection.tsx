'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Server } from 'lucide-react';

const TABS = [
  {
    value: 'saas',
    label: 'SaaS Teams',
    icon: Users,
    headline: 'Protect Your SLA Commitments',
    description:
      'Your customers expect 99.9% uptime. When a vendor API drops, your PagerDuty fires. Reliastra gives you the evidence to redirect blame and recover costs.',
    mockup: {
      title: 'Incident #487 — Stripe Payments Degradation',
      status: 'Vendor Fault Confirmed',
      metric: '$4,200 SLA credit eligible',
    },
  },
  {
    value: 'agencies',
    label: 'Agencies',
    icon: Building2,
    headline: 'Prove It Wasn\'t Your Code',
    description:
      'Clients blame your team for every outage. With Reliastra, show exactly when and how the vendor failed — before your standup even starts.',
    mockup: {
      title: 'Client Report — Q3 Vendor Incidents',
      status: '8 vendor-caused incidents documented',
      metric: '$12,400 in client credits preserved',
    },
  },
  {
    value: 'devops',
    label: 'DevOps',
    icon: Server,
    headline: 'Automate Your War Room',
    description:
      'Stop manually checking vendor dashboards during incidents. Reliastra automatically correlates vendor health with your services and generates evidence.',
    mockup: {
      title: 'Auto-Correlation Alert — Auth0 + API Gateway',
      status: 'Correlated: 99.2% confidence',
      metric: 'Evidence report generated in 3.2s',
    },
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 md:py-32 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
            Use Cases
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            Built for Teams That Depend on Vendors
          </h2>
        </motion.div>

        <Tabs defaultValue="saas" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-white border border-[#E4E4E7] rounded-lg p-1 h-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-md py-2.5 text-xs font-semibold data-[state=active]:bg-[#0891B2] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <motion.div
                className="grid lg:grid-cols-2 gap-12 items-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#09090B]">{tab.headline}</h3>
                  <p className="text-[#52525B] mt-4 leading-relaxed">{tab.description}</p>
                </div>

                {/* Mockup card */}
                <div className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-xs font-medium text-[#16A34A]">{tab.mockup.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#09090B] mb-1">{tab.mockup.title}</p>
                  <div className="mt-4 bg-[#ECFEFF] rounded-lg p-4">
                    <p className="text-2xl font-bold text-[#0891B2]">{tab.mockup.metric}</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
