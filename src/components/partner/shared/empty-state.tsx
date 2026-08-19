'use client';

import { motion } from 'framer-motion';
import { Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReferralLinkCard } from './referral-link-card';

interface EmptyStateProps {
 referralLink: string;
 onGoToDashboard?: () => void;
}

export function EmptyState({ referralLink, onGoToDashboard }: EmptyStateProps) {
 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center py-16 md:py-24 px-4"
 >
 <div className="max-w-lg w-full text-center">
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
 Your first referral is waiting.
 </h3>
 <p className="text-muted-foreground mb-10">
 Start by sharing your link with someone who needs RELIASTRA.
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="mb-10"
 >
 <ReferralLinkCard link={referralLink} size="hero" showLabel={false} />
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="space-y-4 text-left max-w-sm mx-auto"
 >
 <div className="flex gap-3 items-start">
 <span className="text-xs font-mono text-muted-foreground mt-0.5">01</span>
 <p className="text-sm text-foreground/80">Copy your link</p>
 </div>
 <div className="flex gap-3 items-start">
 <span className="text-xs font-mono text-muted-foreground mt-0.5">02</span>
 <p className="text-sm text-foreground/80">Share it with someone who needs RELIASTRA</p>
 </div>
 <div className="flex gap-3 items-start">
 <span className="text-xs font-mono text-muted-foreground mt-0.5">03</span>
 <p className="text-sm text-foreground/80">We&apos;ll track the subscription</p>
 </div>
 <div className="flex gap-3 items-start">
 <span className="text-xs font-mono text-muted-foreground mt-0.5">04</span>
 <p className="text-sm text-foreground/80">You&apos;ll earn 30% every month</p>
 </div>
 </motion.div>

 {onGoToDashboard && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4 }}
 className="mt-10"
 >
 <Button variant="ghost" onClick={onGoToDashboard} className="gap-2">
 GO TO DASHBOARD
 <ArrowRight className="size-4" />
 </Button>
 </motion.div>
 )}
 </div>
 </motion.div>
 );
}