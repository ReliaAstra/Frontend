'use client';

import { motion } from 'framer-motion';
import { Palette, BookOpen, Cpu, HelpCircle, Code, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartnerStore } from '@/stores/partner-store';
import { Separator } from '@/components/ui/separator';

type LucideIcon = typeof Palette;

interface Resource {
  title: string;
  description: string;
  icon: LucideIcon;
  navigate?: string;
}

const resources: Resource[] = [
  {
    title: 'Brand Guidelines',
    description: 'Logo usage, colors, typography rules. Ensure your materials are on-brand.',
    icon: Palette,
  },
  {
    title: 'Referral Playbook',
    description: 'Strategies for effective referrals. Learn what works and what doesn\'t.',
    icon: BookOpen,
  },
  {
    title: 'Technical Overview',
    description: 'Product architecture and capabilities for technical audiences.',
    icon: Cpu,
  },
  {
    title: 'Commission FAQ',
    description: 'Detailed commission questions. Everything about how you get paid.',
    icon: HelpCircle,
    navigate: 'faq',
  },
  {
    title: 'API Documentation',
    description: 'For integrating RELIASTRA references into your own tools.',
    icon: Code,
  },
  {
    title: 'Email Templates',
    description: 'Pre-written email templates for outreach. Personalize and send.',
    icon: Mail,
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function PageResources() {
  const navigate = usePartnerStore((s) => s.navigate);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              RESOURCES
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Partner resources.
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground">
              Everything you need to effectively refer customers to RELIASTRA.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Resource cards grid */}
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.title}
                variants={staggerChild}
                onClick={() => {
                  if (resource.navigate) {
                    navigate(resource.navigate as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={
                  resource.navigate
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }
              >
                <div className="group h-full rounded-lg border border-border/80 p-6 transition-all duration-200 hover:-translate-y-[1px] hover:border-border hover:shadow-sm">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-border/80">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">
                    {resource.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {resource.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    View
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* More resources note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 font-mono text-xs text-muted-foreground"
        >
          More resources are added regularly. Check back for updates.
        </motion.p>
      </div>

      <Separator className="mx-auto max-w-6xl" />

      {/* CTA Section */}
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Ready to start?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Join the partner program and start earning today.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              navigate('signup');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0"
          >
            BECOME A PARTNER
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
