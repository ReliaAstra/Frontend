'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

/**
 * Visual-only feedback control. Nothing is transmitted yet — the state is
 * local so the interaction feels complete without implying data collection.
 */
export function FeedbackWidget() {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  return (
    <div className="mt-16 rounded-[16px] border border-[#E4E4E7] bg-[#FCFCFD] px-6 py-7">
      <AnimatePresence mode="wait" initial={false}>
        {vote === null ? (
          <motion.div
            key="ask"
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <p className="text-[15px] font-medium text-[#09090B]">Was this page helpful?</p>
            <div className="flex items-center gap-2.5">
              {(
                [
                  { id: 'up' as const, Icon: ThumbsUp, label: 'Yes' },
                  { id: 'down' as const, Icon: ThumbsDown, label: 'No' },
                ]
              ).map(({ id, Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVote(id)}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-5 text-sm font-semibold text-[#52525B]',
                    'transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0891B2] hover:text-[#0891B2]',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="thanks"
            className="text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <p className="text-[15px] font-medium text-[#09090B]">Thanks for the signal.</p>
            <p className="mt-1.5 text-sm text-[#52525B]">
              {vote === 'up'
                ? 'Glad it was useful.'
                : 'We will take another pass at this page.'}{' '}
              <a href="/contact" className="font-medium text-[#0891B2] hover:underline">
                Tell us more
              </a>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
