'use client';

import { useState, useCallback, useEffect, Fragment } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { AuthToast } from '@/components/auth/AuthToast';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

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
          Resetting your password through a secure, time-limited channel.
        </p>
      </div>
      <AuthVendorGrid />
      <div className="bg-[#131318] rounded-xl p-4 border border-white/5 w-full">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0891B2]/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#0891B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Secure channel</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              This reset link is single-use and expires after 1 hour. After setting your new password, the link becomes invalid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordContent({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const dismissToast = useCallback(() => setToastError(null), []);

  // Auto-redirect after success
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setToastError('Password must be at least 8 characters.');
      return;
    }
    setToastError(null);
    setLoading(true);
    try {
      await authService.confirmPasswordReset(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : null;
      setToastError(msg || 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <AuthToast message={toastError} onDismiss={dismissToast} />

      {!success ? (
        <>
          <motion.h1
            className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2"
            variants={stagger}
            initial="hidden"
            animate="show"
            custom={0}
          >
            Set new password
          </motion.h1>
          <motion.p
            className="text-base font-normal text-[#52525B] mb-8"
            variants={stagger}
            initial="hidden"
            animate="show"
            custom={1}
          >
            Choose a strong password for your Reliastra account.
          </motion.p>

          <form onSubmit={handleSubmit} noValidate>
            <motion.div className="mb-6" variants={stagger} initial="hidden" animate="show" custom={2}>
              <label htmlFor="rp-password" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
                New password
              </label>
              <div className="relative">
                <input
                  id="rp-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} focused={passwordFocused} />
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" custom={3}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#09090B] hover:bg-[#09090B]/90 text-white font-semibold text-sm rounded-[10px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
          className="text-center py-8"
        >
          <CheckCircle2 className="w-14 h-14 text-[#16A34A] mx-auto mb-4" />
          <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2">
            Password updated
          </h1>
          <p className="text-base text-[#52525B]">
            Redirecting to sign in...
          </p>
        </motion.div>
      )}
    </Fragment>
  );
}

function ResetPasswordPageInner() {
  const params = useParams();
  const token = params.token as string;

  return (
    <AuthSplitLayout leftPanel={<LeftPanel />}>
      <ResetPasswordContent token={token} />
    </AuthSplitLayout>
  );
}

export default ResetPasswordPageInner;
