'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralLinkCardProps {
  link: string;
  size?: 'default' | 'large' | 'hero';
 showLabel?: boolean;
 className?: string;
}

export function ReferralLinkCard({ link, size = 'default', showLabel = true, className = '' }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join RELIASTRA',
          text: 'Check out RELIASTRA — infrastructure intelligence for critical operations.',
          url: link,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const sizeClasses = {
    default: 'p-4',
    large: 'p-6',
    hero: 'p-8 md:p-12',
  };

  const linkSizeClasses = {
    default: 'text-sm',
    large: 'text-base',
    hero: 'text-lg md:text-xl',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Your referral link
        </p>
      )}
      <div
        className={`relative border border-border/80 bg-muted/30 rounded-lg ${sizeClasses[size]} group transition-colors hover:border-border`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Link2 className="size-4 text-muted-foreground shrink-0" />
          <p
            className={`${linkSizeClasses[size]} font-mono text-foreground/90 truncate select-all`}
          >
            {link}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={size === 'hero' ? 'default' : 'secondary'}
            size={size === 'hero' ? 'lg' : 'default'}
            onClick={handleCopy}
            className={size === 'hero' ? 'min-w-[160px]' : ''}
          >
            <motion.span
              key={copied ? 'copied' : 'copy'}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  COPIED
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  COPY LINK
                </>
              )}
            </motion.span>
          </Button>
          <Button
            variant="outline"
            size={size === 'hero' ? 'lg' : 'default'}
            onClick={handleShare}
          >
            <Share2 className="size-4" />
            SHARE
          </Button>
        </div>
      </div>
    </div>
  );
}
