'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { AuthToast } from '@/components/auth/AuthToast';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

function LeftPanelContent() {
  return (
    <>
      <AuthVendorGrid />
      <div className="bg-[#131318] rounded-xl p-4 border border-[#0891B2]/20 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
            Monitoring active
          </span>
        </div>
        <p className="text-[13px] text-white/60 leading-snug">
          Your account security is backed by the same infrastructure that monitors your vendors.
        </p>
      </div>
    </>
  );
}

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.3 + i * 0.08, ease },
  }),
};

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const validateEmail = (value: string) => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : 'Please enter a valid email address.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr || !email) {
      setEmailTouched(true);
      setEmailError(emailErr || 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { authService } = await import('@/services/authService');
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch {
      // Always show success to prevent email enumeration
      setSuccess(true);
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
        {/* Back link */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#A1A1AA] hover:text-[#09090B] transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </motion.div>

        {success ? (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              </div>
              <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] leading-[1.2]">
                Check your email
              </h1>
            </div>
            <p className="text-[16px] text-[#52525B] leading-[1.6] mb-2">
              We sent a password reset link to <span className="font-medium text-[#09090B]">{email}</span>.
            </p>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              If you don&apos;t see the email, check your spam folder. The link expires in 15 minutes.
            </p>
            <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
              <p className="text-sm text-[#52525B]">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-[#0891B2] font-medium hover:text-[#0E7490] transition-colors"
                >
                  Try again
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Headline */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease }}
            >
              <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] leading-[1.2]">
                Reset your password
              </h1>
              <p className="text-[16px] text-[#52525B] mt-2 leading-[1.6]">
                Enter the email associated with your account and we&apos;ll send you a reset link.
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <motion.div
                custom={0}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
                variants={fieldVariants}
              >
                <label
                  htmlFor="reset-email"
                  className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailTouched) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      setEmailError(validateEmail(email));
                    }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-invalid={emailTouched && !!emailError}
                    aria-describedby={emailError ? 'reset-email-error' : undefined}
                    className={`w-full h-12 px-4 pr-10 rounded-[10px] border bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150 ${
                      emailTouched && emailError ? 'border-[#DC2626]' : 'border-[#E4E4E7]'
                    }`}
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
                </div>
                {emailTouched && emailError && (
                  <motion.p
                    id="reset-email-error"
                    role="alert"
                    className="text-[13px] text-[#DC2626] mt-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {emailError}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit */}
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
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

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
