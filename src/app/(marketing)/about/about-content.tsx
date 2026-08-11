'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Zap, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const team = [
  { name: 'Marcus Chen', role: 'Founder & CEO', initials: 'MC', color: 'bg-[#0891B2]' },
  { name: 'Sarah Park', role: 'Head of Product', initials: 'SP', color: 'bg-violet-600' },
  { name: 'Alex Rivera', role: 'Sr. Reliability Engineer', initials: 'AR', color: 'bg-amber-600' },
  { name: 'Jordan Lee', role: 'Head of Growth', initials: 'JL', color: 'bg-emerald-600' },
];

const values = [
  {
    icon: Eye,
    title: 'Transparency First',
    description: 'We believe vendor reliability data should be independently verified and openly accessible. No spin, no delays, no conflicts of interest.',
  },
  {
    icon: Shield,
    title: 'Evidence Over Claims',
    description: 'Claims are cheap. Timestamped, independently collected evidence is what holds vendors accountable and protects engineering teams.',
  },
  {
    icon: Zap,
    title: 'Speed of Detection',
    description: 'Every second of delayed detection costs our customers money. We optimize relentlessly for the fastest possible incident identification.',
  },
];

export function AboutContent() {
  return (
    <>
      {/* Story */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">About Reliastra</h1>
              <div className="mt-8 space-y-4 text-[#52525B] leading-relaxed">
                <p>
                  Reliastra was born from a frustrating reality: modern applications depend on dozens of external services,
                  but when those services fail, engineering teams are left in the dark. Vendor status pages are slow to update,
                  often inaccurate, and inherently conflicted. Incident post-mortems take hours. SLA disputes drag on for weeks.
                </p>
                <p>
                  Our founder, Marcus Chen, experienced this firsthand during his 4 years as an SRE at Stripe. After one particularly
                  painful multi-vendor outage that required 40+ hours of manual correlation work, he started building internal tooling
                  to automate the process. That tooling became the foundation of Reliastra.
                </p>
                <p>
                  Today, Reliastra provides independent monitoring, automated incident correlation, and SLA evidence generation for
                  engineering teams of all sizes. We are building the definitive intelligence layer for external dependencies — because
                  every team deserves ground truth about the services they depend on.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Our Mission</h2>
            <p className="mt-4 text-lg text-[#52525B] leading-relaxed">
              To give every engineering team independent, real-time intelligence about the reliability of their external
              dependencies — and the automated evidence to hold vendors accountable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">The Team</h2>
            <p className="mt-2 text-[#52525B]">Built by engineers who lived the problem.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`h-20 w-20 rounded-2xl ${member.color} text-white flex items-center justify-center text-xl font-bold mx-auto`}>
                  {member.initials}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#09090B]">{member.name}</h3>
                <p className="text-xs text-[#52525B]">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="rounded-xl p-6 h-full">
                    <CardContent className="p-0">
                      <Icon className="h-8 w-8 text-[#0891B2] mb-4" />
                      <h3 className="text-lg font-semibold text-[#09090B]">{v.title}</h3>
                      <p className="mt-2 text-sm text-[#52525B] leading-relaxed">{v.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Press Kit */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-[#09090B] mb-4">Press Kit</h2>
            <p className="text-[#52525B] mb-6 max-w-md mx-auto">
              Logo assets, brand guidelines, and company boilerplate for media and partners.
            </p>
            <Button variant="outline" className="rounded-lg gap-2" asChild>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>
                <ExternalLink className="h-4 w-4" />
                Download Press Kit
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
