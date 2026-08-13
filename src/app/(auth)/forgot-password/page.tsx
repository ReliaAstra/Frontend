'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';

const ease = [0.25, 0.1, 0.25, 1] as const;

const stagger = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.3 + i * 0.08, ease },
  }),
};

const inputClass =
  'w-full h-12 rounded-[10px] border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] px-4 outline-none transition-all focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2]';

function LeftPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-[-0.02em] mb-2">
          External Dependency Intelligence
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Your account security is our priority. We use end-to-end encryption for all sensitive operations.
        </p>
      </div>
      <AuthVendorGrid />
      <div className="bg-[#131318] rounded-xl p-4 border border-white/5 w-full">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0891B2]/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#0891B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Secure by default</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Password reset links expire after 1 hour and can only be used once. We never store your password in plaintext.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) return 'Please enter your email address.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return 'Please enter a valid email address.';
    return null;
  };

  const handleEmailBlur = () => {
    setEmailError(email ? validateEmail(email) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(null);
    setLoading(true);
    try {
      // Anti-enumeration: always show success regardless
      await authService.requestPasswordReset(email);
    } catch {
      // Swallow — anti-enumeration
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleTryAgain = () => {
    setEmail('');
    setEmailError(null);
    setSent(false);
  };

  return (
    <>
      {/* Back link */}
      <motion.div variants={stagger} initial="hidden" animate="show" custom={0}>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#52525B] hover:text-[#09090B] font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </motion.div>

      {!sent ? (
        <>
          <motion.h1
            className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2"
            variants={stagger}
            initial="hidden"
            animate="show"
            custom={1}
          >
            Reset your password
          </motion.h1>
          <motion.p
            className="text-base font-normal text-[#52525B] mb-8"
            variants={stagger}
            initial="hidden"
            animate="show"
            custom={2}
          >
            We&apos;ll send you a link to reset your password. Check your inbox after submitting.
          </motion.p>

          <form onSubmit={handleSubmit} noValidate>
            <motion.div className="mb-6" variants={stagger} initial="hidden" animate="show" custom={3}>
              <label htmlFor="fp-email" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'fp-email-error' : undefined}
                  className={`${inputClass} pl-10`}
                />
              </div>
              {emailError && (
                <p id="fp-email-error" className="text-xs text-[#DC2626] mt-1.5" role="alert">
                  {emailError}
                </p>
              )}
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" custom={4}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#09090B] hover:bg-[#09090B]/90 text-white font-semibold text-sm rounded-[10px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </motion.div>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
          className="text-center py-8"
        >
          <CheckCircle2 className="w-14 h-14 text-[#16A34A] mx-auto mb-4" />
          <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2">
            Check your email
          </h1>
          <p className="text-base text-[#52525B] mb-1">
            We sent a reset link to
          </p>
          <p className="text-sm font-semibold text-[#09090B] mb-6">
            {email}
          </p>
          <button
            type="button"
            onClick={handleTryAgain}
            className="text-sm text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors"
          >
            Try a different email
          </button>
        </motion.div>
      )}
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout leftPanel={<LeftPanel />}>
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
