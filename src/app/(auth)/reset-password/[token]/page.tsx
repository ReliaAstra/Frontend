'use client';

import { Suspense, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { AuthToast } from '@/components/auth/AuthToast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2, Check, Circle } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

/* ── Password Strength (extracted for reuse) ────────────────────── */

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
] as const;

function getStrength(password: string): { level: number; label: string; color: string } {
  const met = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  if (met === 0) return { level: 0, label: '', color: '#E4E4E7' };
  if (met === 1) return { level: 1, label: 'Weak', color: '#DC2626' };
  if (met === 2) return { level: 2, label: 'Fair', color: '#D97706' };
  if (met === 3) return { level: 3, label: 'Good', color: '#0891B2' };
  return { level: 4, label: 'Strong', color: '#16A34A' };
}

export function PasswordStrengthIndicator({ password, focused }: { password: string; focused: boolean }) {
  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < strength.level ? strength.color : '#E4E4E7' }}
          />
        ))}
      </div>
      {password && strength.label && (
        <p className="text-xs mt-1.5" style={{ color: strength.color }}>
          Password strength: {strength.label}
        </p>
      )}
      {focused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease }}
          className="overflow-hidden"
        >
          <div className="mt-2 space-y-1">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const met = req.test(password);
              return (
                <div key={req.label} className="flex items-center gap-1.5">
                  {met ? (
                    <Check className="w-3 h-3 text-[#16A34A] shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-[#A1A1AA] shrink-0" />
                  )}
                  <span className={`text-xs ${met ? 'text-[#16A34A]' : 'text-[#A1A1AA]'}`}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Form Variants ───────────────────────────────────────────────── */

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.3 + i * 0.08, ease },
  }),
};

/* ── Left Panel ──────────────────────────────────────────────────── */

function LeftPanelContent() {
  return (
    <>
      <AuthVendorGrid />
      <div className="bg-[#131318] rounded-xl p-4 border border-[#0891B2]/20 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
            Secure channel
          </span>
        </div>
        <p className="text-[13px] text-white/60 leading-snug">
          Password reset links are single-use and expire after 15 minutes.
        </p>
      </div>
    </>
  );
}

/* ── Reset Form ──────────────────────────────────────────────────── */

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setToastMessage('Password must be at least 8 characters.');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);
      return;
    }

    setLoading(true);
    try {
      const { authService } = await import('@/services/authService');
      await authService.confirmPasswordReset(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setToastMessage('This reset link may have expired. Please request a new one.');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <>
      <AuthToast message={toastMessage} visible={toastVisible} onDismiss={dismissToast} />
      <AuthSplitLayout leftPanelExtra={<LeftPanelContent />}>
        {success ? (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] leading-[1.2]">
              Password updated
            </h1>
            <p className="text-[16px] text-[#52525B] mt-3 leading-[1.6]">
              Your password has been changed. Redirecting to sign in...
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease }}
            >
              <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] leading-[1.2]">
                Set new password
              </h1>
              <p className="text-[16px] text-[#52525B] mt-2 leading-[1.6]">
                Choose a strong password for your Reliastra account.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <motion.div
                custom={0}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
                variants={fieldVariants}
              >
                <label
                  htmlFor="new-password"
                  className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
                >
                  New password <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="w-full h-12 px-4 pr-10 rounded-[10px] border border-[#E4E4E7] bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={password} focused={passwordFocused} />
              </motion.div>

              <motion.div
                custom={1}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
                variants={fieldVariants}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#0A0A0F] text-white rounded-[10px] font-semibold text-[15px] hover:bg-neutral-800 hover:-translate-y-px hover:shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </motion.div>
            </form>
          </>
        )}
      </AuthSplitLayout>
    </>
  );
}

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return (
    <Suspense>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}
