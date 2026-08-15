'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Github, BookOpen, FileText, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const capabilities = [
  {
    title: 'Independent Detection',
    description: 'Multi-region probes detect vendor degradation independently from internal monitoring. Detection is not dependent on the vendor\'s own status page.',
  },
  {
    title: 'SLA Evidence Generation',
    description: 'When a vendor incident occurs, Reliastra produces a structured evidence report with timestamped observations from independent infrastructure.',
  },
  {
    title: 'Incident Correlation',
    description: 'Vendor degradation signals are correlated with your service metrics to evaluate whether an external dependency is a likely contributor to an incident.',
  },
];

const resources = [
  { name: 'Documentation', description: 'Set up Reliastra and configure your first monitored dependency.', icon: BookOpen, href: '#' },
  { name: 'API Reference', description: 'Full REST API docs for custom integrations.', icon: FileText, href: '#' },
  { name: 'Guides', description: 'Step-by-step tutorials for advanced use cases.', icon: ExternalLink, href: '/blog' },
];

export function CommunityContent() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-8 w-8 text-[#0891B2]" />
              <span className="text-sm font-medium text-[#0891B2]">Engineers monitoring vendor reliability</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">
              Reliastra Community
            </h1>
            <p className="mt-4 text-lg text-[#52525B] max-w-2xl mx-auto">
              Documentation, discussions, and vendor reliability data.
              Share strategies, get help, and shape the product roadmap.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Discord & GitHub */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-xl p-6 h-full">
                <CardContent className="p-0">
                  <MessageCircle className="h-10 w-10 text-[#5865F2] mb-4" />
                  <h2 className="text-xl font-bold text-[#09090B]">Discord Community</h2>
                  <p className="mt-2 text-[#52525B]">
                    Join 800+ engineers in real-time discussions. Get help with setup,
                    share vendor reliability war stories, and connect with the Reliastra team.
                  </p>
                  <Button className="mt-6 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg" asChild>
                    <a href="https://discord.gg/reliastre" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Join Discord
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="rounded-xl p-6 h-full">
                <CardContent className="p-0">
                  <Github className="h-10 w-10 text-[#09090B] mb-4" />
                  <h2 className="text-xl font-bold text-[#09090B]">GitHub Discussions</h2>
                  <p className="mt-2 text-[#52525B]">
                    Report bugs, request features, and contribute to open-source
                    tooling. Our roadmap is publicly visible and community-driven.
                  </p>
                  <Button variant="outline" className="mt-6 rounded-lg" asChild>
                    <a href="https://github.com/ReliaAstra" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Reliastra Capabilities</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="rounded-xl p-6 h-full">
                  <CardContent className="p-0">
                    <h3 className="text-base font-semibold text-[#09090B] mb-2">{c.title}</h3>
                    <p className="text-sm text-[#52525B] leading-relaxed">{c.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Resources</h2>
            <p className="mt-2 text-[#52525B]">Documentation and reference material for Reliastra.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="rounded-xl p-6 h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <Icon className="h-8 w-8 text-[#0891B2] mb-3" />
                      <h3 className="text-base font-semibold text-[#09090B]">{r.name}</h3>
                      <p className="mt-1 text-sm text-[#52525B]">{r.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
