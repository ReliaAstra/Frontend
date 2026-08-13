'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  focused: boolean;
}

function getStrength(password: string): { level: number; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors: string[] = ['#DC2626', '#D97706', '#0891B2', '#16A34A'];
  if (password.length === 0) return { level: 0, color: '#E4E4E7' };
  return { level: score, color: colors[score - 1] || '#DC2626' };
}

const REQUIREMENTS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password, focused }: PasswordStrengthProps) {
  const { level, color } = getStrength(password);
  const showChecklist = focused || password.length > 0;

  return (
    <div>
      {/* 4-segment bar */}
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: i < level ? color : '#E4E4E7',
            }}
          />
        ))}
      </div>

      {/* Checklist — appears on focus with height animation */}
      <AnimatePresence>
        {showChecklist && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5">
              {REQUIREMENTS.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-2">
                    {met ? (
                      <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
                    )}
                    <span
                      className={`text-xs transition-colors duration-200 ${
                        met ? 'text-[#16A34A] font-medium' : 'text-[#A1A1AA]'
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
