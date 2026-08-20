'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const metrics = [
  { label: 'TAM', value: '$4.2B', description: 'Total addressable market for API monitoring & observability', icon: DollarSign },
  { label: 'SAM', value: '$1.8B', description: 'Serviceable market for external dependency intelligence', icon: Target },
  { label: 'SOM', value: '$120M', description: 'Serviceable obtainable market in our initial ICP', icon: TrendingUp },
];

export function InvestorsContent() {
  const [form, setForm] = useState({ name: '', email: '', firm: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.firm) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company: form.firm, message: `[Investor Inquiry] ${form.message}` }),
      });
      if (res.ok) {
        toast.success('Inquiry submitted. We\'ll be in touch within 24 hours.');
        setForm({ name: '', email: '', firm: '', message: '' });
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero + Founder */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">Investment Opportunity</h1>
              <p className="mt-4 text-lg text-[#52525B] leading-relaxed">
                Reliastra is the first independent intelligence layer for external dependencies.
                We help engineering teams monitor, correlate, and hold vendors accountable for reliability :  a $4.2B market with no dominant player.
              </p>
            </motion.div>

            {/* Founder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 flex gap-5"
            >
              <div className="h-20 w-20 rounded-2xl bg-[#0891B2] text-white flex items-center justify-center text-2xl font-bold shrink-0">
                EO
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#09090B]">Emmanuel Osei</h2>
                <p className="text-sm text-[#0891B2] font-medium">Founder & CEO</p>
                <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
                  Founded Reliastra to give engineering teams independent measurements of the
                  vendors they depend on, plus evidence they can use when those vendors fail.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-[#09090B] mb-4">Our Vision</h2>
            <div className="max-w-3xl">
              <p className="text-[#52525B] leading-relaxed">
                Every modern application is built on a web of external dependencies :  APIs, SaaS platforms,
                cloud services. When one of these fails, the downstream impact is massive, but the
                responsibility is unclear and the evidence is fragmented.
              </p>
              <p className="mt-4 text-[#52525B] leading-relaxed">
                Reliastra is building the definitive intelligence layer for this problem. We provide
                independent monitoring, automated incident correlation, and SLA evidence generation that
                gives engineering teams ground truth about their vendor ecosystem.
              </p>
              <p className="mt-4 text-[#52525B] leading-relaxed">
                Our long-term vision: every engineering team has real-time visibility into the reliability
                of every dependency they depend on, and the automated evidence to hold vendors accountable.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Size */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Market Opportunity</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">Internal working estimates, not audited market research.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="rounded-xl p-6 text-center h-full">
                    <CardContent className="p-0">
                      <Icon className="h-8 w-8 text-[#0891B2] mx-auto mb-3" />
                      <p className="text-3xl font-bold text-[#09090B]">{m.value}</p>
                      <p className="text-sm font-medium text-[#52525B] mt-1">{m.label}</p>
                      <p className="text-xs text-[#A1A1AA] mt-2">{m.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Traction</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="rounded-xl p-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-[#0891B2]" />
                  <h3 className="text-sm font-medium text-[#52525B]">Customers</h3>
                </div>
                <p className="text-2xl font-bold text-[#09090B]">0 → Target: 100</p>
                <p className="text-xs text-[#A1A1AA] mt-1">by Q4 2026</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl p-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-[#0891B2]" />
                  <h3 className="text-sm font-medium text-[#52525B]">Endpoints Monitored</h3>
                </div>
                <p className="text-2xl font-bold text-[#09090B]">0 → Target: 10,000</p>
                <p className="text-xs text-[#A1A1AA] mt-1">by Q4 2026</p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-8 text-center text-sm text-[#52525B]">
            For investor materials, use the form below.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <h2 className="text-3xl font-bold text-[#09090B] mb-2">Contact</h2>
            <p className="text-[#52525B] mb-8">
              Interested in learning more? We respond to investor inquiries within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="inv-name" className="block text-sm font-medium text-[#09090B] mb-1.5">Name *</label>
                <Input id="inv-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" className="rounded-lg" />
              </div>
              <div>
                <label htmlFor="inv-email" className="block text-sm font-medium text-[#09090B] mb-1.5">Email *</label>
                <Input id="inv-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@vc.com" className="rounded-lg" />
              </div>
              <div>
                <label htmlFor="inv-firm" className="block text-sm font-medium text-[#09090B] mb-1.5">Firm *</label>
                <Input id="inv-firm" value={form.firm} onChange={(e) => setForm((p) => ({ ...p, firm: e.target.value }))} placeholder="Venture Capital LLC" className="rounded-lg" />
              </div>
              <div>
                <label htmlFor="inv-message" className="block text-sm font-medium text-[#09090B] mb-1.5">Message</label>
                <Textarea id="inv-message" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Describe your interest in Reliastra." rows={4} className="rounded-lg" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg">
                {submitting ? 'Sending...' : 'Submit Inquiry'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
