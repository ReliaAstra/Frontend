'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, BookOpen, Cpu, HelpCircle, Code, Mail, ArrowRight, X, ExternalLink, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartnerStore } from '@/stores/partner-store';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type LucideIcon = typeof Palette;

interface Resource {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  readTime: string;
  navigate?: string;
  content: ResourceContent;
}

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'tip' | 'color-swatch' | 'template';
  content: string;
  items?: string[];
  lang?: string;
  colors?: { name: string; value: string }[];
  templateData?: { subject: string; body: string };
}

interface ResourceContent {
  summary: string;
  blocks: ContentBlock[];
}

const resources: Resource[] = [
  {
    title: 'Brand Guidelines',
    description: 'Logo usage, colors, typography rules. Ensure your materials are on-brand.',
    icon: Palette,
    category: 'Brand',
    readTime: '5 min read',
    content: {
      summary: 'Official guidelines for using RELIASTRA branding in your partner materials, presentations, and referral content.',
      blocks: [
        {
          type: 'heading',
          content: 'Logo Usage',
        },
        {
          type: 'paragraph',
          content: 'The RELIASTRA logo should always appear with adequate clear space. Never stretch, rotate, or alter the logo. Use the provided SVG files for digital applications and high-resolution PNGs for print.',
        },
        {
          type: 'list',
          content: 'Minimum clear space equals the height of the checkmark inside the logo mark.',
          items: [
            'Always display the logo at its original proportions',
            'Minimum size: 24px width for digital, 0.5" for print',
            'Never place the logo on busy backgrounds without a container',
            'The wordmark "RELIASTRA" uses Inter or a similar geometric sans-serif',
            'On dark backgrounds, use the reversed (white) version',
          ],
        },
        {
          type: 'heading',
          content: 'Color Palette',
        },
        {
          type: 'color-swatch',
          content: 'Primary colors used across RELIASTRA brand materials.',
          colors: [
            { name: 'Primary Black', value: '#09090B' },
            { name: 'Foreground', value: '#18181B' },
            { name: 'Muted', value: '#71717A' },
            { name: 'Border', value: '#E4E4E7' },
            { name: 'Background', value: '#FAFAFA' },
            { name: 'Accent Emerald', value: '#10B981' },
          ],
        },
        {
          type: 'heading',
          content: 'Typography',
        },
        {
          type: 'paragraph',
          content: 'RELIASTRA uses Inter as its primary typeface. For mono-spaced elements (labels, code, metadata), use JetBrains Mono. Headlines use semibold weight (600), body text uses regular (400).',
        },
        {
          type: 'tip',
          content: 'When creating referral materials, use the RELIASTRA brand colors as accents only. Your own brand identity should remain primary — the goal is subtle co-branding, not a full rebrand.',
        },
      ],
    },
  },
  {
    title: 'Referral Playbook',
    description: 'Strategies for effective referrals. Learn what works and what doesn\'t.',
    icon: BookOpen,
    category: 'Strategy',
    readTime: '8 min read',
    content: {
      summary: 'Battle-tested strategies from top-performing partners. Learn how to identify prospects, craft your pitch, and close referrals consistently.',
      blocks: [
        {
          type: 'heading',
          content: 'Identifying the Right Prospects',
        },
        {
          type: 'paragraph',
          content: 'The most effective referrals come from existing relationships. Look for people who have explicitly mentioned infrastructure reliability challenges, incident management pain, or compliance reporting needs.',
        },
        {
          type: 'list',
          content: 'Signs someone is a strong referral candidate:',
          items: [
            'They manage or oversee production infrastructure',
            'They\'ve expressed frustration with post-incident processes',
            'They need to produce evidence-based reliability reports',
            'Their team spends significant time on manual correlation',
            'They work in regulated industries (finance, healthcare, energy)',
          ],
        },
        {
          type: 'heading',
          content: 'The Referral Conversation',
        },
        {
          type: 'paragraph',
          content: 'Don\'t lead with the commission. Lead with the problem RELIASTRA solves. Frame it as: "I found something that addresses [specific pain point] we talked about." Let the product speak for itself — your role is to make the introduction.',
        },
        {
          type: 'tip',
          content: 'Avoid hard-selling. The best referrals feel like helpful recommendations between professionals, not sales pitches. Share your referral link naturally, ideally in a 1:1 context.',
        },
        {
          type: 'heading',
          content: 'Follow-Up Cadence',
        },
        {
          type: 'paragraph',
          content: 'After sharing your link, wait 5-7 days before following up. A simple "Did you get a chance to look at RELIASTRA? Happy to walk through it" is sufficient. Avoid more than two follow-ups — if they\'re not interested, move on.',
        },
        {
          type: 'heading',
          content: 'Channels That Work Best',
        },
        {
          type: 'list',
          content: 'Ranked by conversion rate from partner data:',
          items: [
            '1:1 email or Slack message (highest conversion)',
            'In-person conversation at events/meetings',
            'Technical blog post with contextual mention',
            'Community forum or Discord recommendation',
            'Social media post (lowest conversion, highest reach)',
          ],
        },
      ],
    },
  },
  {
    title: 'Technical Overview',
    description: 'Product architecture and capabilities for technical audiences.',
    icon: Cpu,
    category: 'Product',
    readTime: '6 min read',
    content: {
      summary: 'A technical summary of RELIASTRA\'s architecture and capabilities, designed to help you answer technical questions from prospects.',
      blocks: [
        {
          type: 'heading',
          content: 'What RELIASTRA Does',
        },
        {
          type: 'paragraph',
          content: 'RELIASTRA is an infrastructure reliability platform that provides incident tracking, cross-system correlation, and evidence-based reporting. It connects to your existing monitoring tools and enriches incident data with dependency mapping.',
        },
        {
          type: 'heading',
          content: 'Core Capabilities',
        },
        {
          type: 'list',
          content: 'Three pillars of the platform:',
          items: [
            'TRACK — Full incident timeline with automated evidence collection from connected tools',
            'CORRELATE — Cross-system dependency mapping reveals root causes across services',
            'PROVE — Actionable compliance reports and stakeholder-ready incident summaries',
          ],
        },
        {
          type: 'heading',
          content: 'Integration Points',
        },
        {
          type: 'paragraph',
          content: 'RELIASTRA integrates with common infrastructure tooling via webhooks and APIs. Typical setup takes under 30 minutes. No agents or sidecars required — it works with your existing observability stack.',
        },
        {
          type: 'code',
          content: `# Example webhook configuration
{
  "endpoint": "https://app.reliastra.com/webhooks/incidents",
  "events": ["incident.created", "incident.updated", "incident.resolved"],
  "secret": "whsec_..."
}`,
          lang: 'json',
        },
        {
          type: 'tip',
          content: 'When prospects ask technical questions you can\'t answer, direct them to support@reliastra.com or the RELIASTRA documentation. You don\'t need to be a product expert — you need to be a trusted introducer.',
        },
      ],
    },
  },
  {
    title: 'Commission FAQ',
    description: 'Detailed commission questions. Everything about how you get paid.',
    icon: HelpCircle,
    category: 'Finance',
    readTime: '4 min read',
    navigate: 'faq',
    content: {
      summary: 'Comprehensive answers to the most common commission and payment questions from partners.',
      blocks: [
        {
          type: 'paragraph',
          content: 'For the full FAQ covering all aspects of the partner program, visit our dedicated FAQ page.',
        },
        {
          type: 'tip',
          content: 'This resource covers commission-specific questions. For program structure, eligibility, and referral tracking, see the main FAQ page.',
        },
      ],
    },
  },
  {
    title: 'API Documentation',
    description: 'For integrating RELIASTRA references into your own tools.',
    icon: Code,
    category: 'Developer',
    readTime: '7 min read',
    content: {
      summary: 'API reference for partners who want to build custom integrations or embed RELIASTRA referral tracking into their own applications.',
      blocks: [
        {
          type: 'heading',
          content: 'Partner API Overview',
        },
        {
          type: 'paragraph',
          content: 'The Partner API allows you to programmatically access your referral data, commission history, and payout status. All endpoints require a partner API key available in your dashboard settings.',
        },
        {
          type: 'heading',
          content: 'Authentication',
        },
        {
          type: 'code',
          content: `curl -X GET https://app.reliastra.com/api/partner/v1/referrals \
  -H "Authorization: Bearer ra_partner_sk_..." \
  -H "Content-Type: application/json"`,
          lang: 'bash',
        },
        {
          type: 'heading',
          content: 'Available Endpoints',
        },
        {
          type: 'list',
          content: 'Core partner API endpoints:',
          items: [
            'GET /v1/referrals — List all referrals with status and earnings',
            'GET /v1/commissions — Commission history with period breakdown',
            'GET /v1/payouts — Payout status and payment history',
            'GET /v1/stats — Summary statistics for dashboard widgets',
            'POST /v1/referrals/attribution — Manually attribute a referral',
          ],
        },
        {
          type: 'heading',
          content: 'Rate Limits',
        },
        {
          type: 'paragraph',
          content: 'Partner API is rate-limited to 100 requests per minute. Standard HTTP rate limit headers are included in all responses. If you need higher throughput, contact support.',
        },
        {
          type: 'tip',
          content: 'API access is available to all active partners. Your API key can be regenerated from Settings > API Access in the partner dashboard.',
        },
      ],
    },
  },
  {
    title: 'Email Templates',
    description: 'Pre-written email templates for outreach. Personalize and send.',
    icon: Mail,
    category: 'Outreach',
    readTime: '3 min read',
    content: {
      summary: 'Copy-ready email templates for different referral scenarios. Personalize the bracketed sections before sending.',
      blocks: [
        {
          type: 'heading',
          content: 'Template 1: Direct Introduction',
        },
        {
          type: 'template',
          content: 'Best for warm contacts who have expressed infrastructure challenges.',
          templateData: {
            subject: 'Found something for your incident management workflow',
            body: 'Hi [Name],\n\nFollowing up on our conversation about [specific pain point]. I\'ve been using a tool called RELIASTRA that handles exactly this — it tracks incidents across systems and produces the correlation reports you mentioned needing.\n\nWorth a look: [your referral link]\n\nHappy to share more about my experience with it if useful.\n\nBest,\n[Your name]',
          },
        },
        {
          type: 'heading',
          content: 'Template 2: Technical Community Share',
        },
        {
          type: 'template',
          content: 'Best for sharing in Slack communities, Discord servers, or email lists.',
          templateData: {
            subject: 'Tool recommendation: cross-system incident correlation',
            body: 'Hey everyone — wanted to share a tool I\'ve been using for incident tracking and cross-system correlation. RELIASTRA connects to your existing monitoring stack and builds dependency maps automatically.\n\nThe evidence-based reporting has been particularly useful for our compliance audits.\n\nIf you want to check it out: [your referral link]\n\nHappy to answer questions about my setup.',
          },
        },
        {
          type: 'heading',
          content: 'Template 3: Client Recommendation',
        },
        {
          type: 'template',
          content: 'Best for consultants and agencies recommending to clients.',
          templateData: {
            subject: 'Incident management recommendation for [Client Name]',
            body: 'Hi [Name],\n\nDuring our recent assessment, I identified an opportunity to improve your incident response workflow. I\'d recommend evaluating RELIASTRA — it provides the cross-system correlation and audit-ready reporting that aligns with your compliance requirements.\n\nYou can explore the platform here: [your referral link]\n\nI\'m happy to facilitate an introduction to their team if you\'d like.\n\nRegards,\n[Your name]',
          },
        },
        {
          type: 'tip',
          content: 'Always personalize the [bracketed] sections. Generic outreach converts at less than 2%, while personalized messages convert at 15-25%. The more specific you are about the prospect\'s situation, the better.',
        },
      ],
    },
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
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

// --- Resource detail sheet content ---
function ResourceDetail({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/60 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/80">
              <resource.icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{resource.title}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {resource.category}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground">{resource.readTime}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Body - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {resource.content.summary}
        </p>

        <div className="mt-8 space-y-8">
          {resource.content.blocks.map((block, i) => (
            <div key={i}>
              {block.type === 'heading' && (
                <h3 className="mb-3 text-sm font-semibold text-foreground">{block.content}</h3>
              )}

              {block.type === 'paragraph' && (
                <p className="text-sm leading-relaxed text-muted-foreground">{block.content}</p>
              )}

              {block.type === 'list' && (
                <div className="space-y-2">
                  {block.content && (
                    <p className="mb-2 text-sm text-muted-foreground">{block.content}</p>
                  )}
                  {block.items?.map((item, j) => (
                    <div key={j} className="flex gap-2.5">
                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {block.type === 'code' && (
                <div className="relative rounded-lg border border-border/60 bg-muted/30">
                  <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {block.lang || 'code'}
                    </span>
                    <button
                      onClick={() => handleCopy(block.content, `code-${i}`)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {copiedId === `code-${i}` ? (
                        <><Check className="size-3" /> Copied</>
                      ) : (
                        <><Copy className="size-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4">
                    <code className="font-mono text-xs leading-relaxed text-foreground/80">
                      {block.content}
                    </code>
                  </pre>
                </div>
              )}

              {block.type === 'tip' && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/40 px-4 py-3">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700">
                    Pro tip
                  </p>
                  <p className="text-sm leading-relaxed text-emerald-900/80">{block.content}</p>
                </div>
              )}

              {block.type === 'color-swatch' && (
                <div>
                  {block.content && (
                    <p className="mb-3 text-sm text-muted-foreground">{block.content}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {block.colors?.map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2.5"
                      >
                        <div
                          className="h-6 w-6 shrink-0 rounded border border-border/40"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{color.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{color.value}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(color.value, `color-${color.name}`)}
                          className="ml-auto shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:text-foreground"
                          aria-label={`Copy ${color.value}`}
                        >
                          {copiedId === `color-${color.name}` ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.type === 'template' && block.templateData && (
                <div className="rounded-lg border border-border/60 bg-background">
                  <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{block.content}</span>
                    <button
                      onClick={() => handleCopy(`${block.templateData!.subject}\n\n${block.templateData!.body}`, `tpl-${i}`)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {copiedId === `tpl-${i}` ? (
                        <><Check className="size-3" /> Copied</>
                      ) : (
                        <><Copy className="size-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Subject
                      </span>
                    </p>
                    <p className="mb-3 text-sm font-medium text-foreground">
                      {block.templateData.subject}
                    </p>
                    <p className="mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Body
                      </span>
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                      {block.templateData.body}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 px-6 py-4">
        {resource.navigate ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              setTimeout(() => {
                usePartnerStore.getState().navigate(resource.navigate as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 200);
            }}
            className="w-full gap-2"
          >
            View full FAQ page
            <ExternalLink className="size-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

export function PageResources() {
  const navigate = usePartnerStore((s) => s.navigate);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
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
                onClick={() => setSelectedResource(resource)}
                className="cursor-pointer"
              >
                <div className="group h-full rounded-lg border border-border/80 p-6 transition-all duration-200 hover:-translate-y-[1px] hover:border-foreground/20 hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 transition-colors group-hover:border-foreground/20">
                      <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      {resource.readTime}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">
                    {resource.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {resource.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    View
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
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
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
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

      {/* Resource Detail Sheet */}
      {selectedResource && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setSelectedResource(null)}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-border/60 bg-background shadow-2xl sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <ResourceDetail
              resource={selectedResource}
              onClose={() => setSelectedResource(null)}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
