'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface AuthToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function AuthToast({ message, visible, onDismiss }: AuthToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-6 right-6 z-50 bg-red-50 border border-red-200/80 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 shadow-lg max-w-[360px]"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{message}</span>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
