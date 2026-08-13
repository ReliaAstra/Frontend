'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface AuthToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function AuthToast({ message, onDismiss }: AuthToastProps) {
  // Track how many messages we've seen to detect changes
  const [messageKey, setMessageKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Derive message ID from the message itself
  const messageId = message ?? '';

  // Detect when a new message arrives (different from last)
  const lastMessageRef = useRef(messageId);
  useEffect(() => {
    if (messageId !== lastMessageRef.current) {
      lastMessageRef.current = messageId;
      // Use a microtask to avoid the synchronous setState-in-effect rule
      queueMicrotask(() => {
        setMessageKey((k) => k + 1);
        setDismissed(false);
      });
    }
  }, [messageId]);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!message || dismissed) return;
    const timer = setTimeout(() => {
      setDismissed(true);
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, dismissed, messageKey, onDismiss]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss();
  }, [onDismiss]);

  const visible = !!message && !dismissed;

  return (
    <div className="fixed top-4 right-4 z-50" aria-live="assertive">
      <AnimatePresence>
        {visible && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, x: 60, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 60, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 max-w-[380px]"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 flex-1 leading-snug">{message}</p>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-red-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}