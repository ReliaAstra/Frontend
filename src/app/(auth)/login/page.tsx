'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/services/authService';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { AnimatedCounter } from '@/components/auth/AnimatedCounter';
import { AuthToast } from '@/components/auth/AuthToast';

const ease = [0.25, 0.1, 0.25, 1] as const;

const stagger = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.3 + i * 0.08, ease },
  }),
};

function LeftPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-[-0.02em] mb-2">
          External Dependency Intelligence
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Real-time monitoring and incident correlation for the services your product depends on.
        </p>
      </div>
      <AuthVendorGrid />
      <div className="mt-2">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
          This month
        </p>
        <p className="text-white text-lg font-semibold">
          <AnimatedCounter value="12,847" className="text-[#0891B2]" /> incidents correlated
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, loginError, clearErrors, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  // Sync loginError from context into toast
  useEffect(() => {
    if (loginError) setToastError(loginError);
  }, [loginError]);

  const dismissToast = useCallback(() => setToastError(null), []);

  const validateEmail = (val: string) => {
    if (!val) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return 'Please enter a valid email address.';
    return null;
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(validateEmail(email));
    if (!email || !password) {
      setToastError('Please enter your email and password.');
      return;
    }
    if (emailError) return;

    clearErrors();
    setToastError(null);
    setLoading(true);
    setSuccess(false);
    try {
      await login(email, password);
      setSuccess(true);
    } catch {
      // Error handled via context -> toast
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-[10px] border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] px-4 outline-none transition-all focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2]';

  return (
    <>
      <AuthToast message={toastError} onDismiss={dismissToast} />

      {/* Header */}
      <motion.h1
        className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={0}
      >
        Sign in to Reliastra
      </motion.h1>
      <motion.p
        className="text-base font-normal text-[#52525B] mb-8"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={1}
      >
        Access your dependency intelligence console.
      </motion.p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <motion.div className="mb-4" variants={stagger} initial="hidden" animate="show" custom={2}>
          <label htmlFor="login-email" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
            <input
              id="login-email"
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
              aria-describedby={emailError ? 'login-email-error' : undefined}
              className={`${inputClass} pl-10`}
            />
          </div>
          {emailError && (
            <p id="login-email-error" className="text-xs text-[#DC2626] mt-1.5" role="alert">
              {emailError}
            </p>
          )}
        </motion.div>

        {/* Password */}
        <motion.div className="mb-4" variants={stagger} initial="hidden" animate="show" custom={3}>
          <label htmlFor="login-password" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
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
        </motion.div>

        {/* Remember me / Forgot password */}
        <motion.div
          className="flex items-center justify-between mb-6"
          variants={stagger}
          initial="hidden"
          animate="show"
          custom={4}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#E4E4E7] text-[#0891B2] focus:ring-[#0891B2]"
            />
            <span className="text-sm text-[#52525B]">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>

        {/* Primary CTA */}
        <motion.div variants={stagger} initial="hidden" animate="show" custom={5}>
          <button
            type="submit"
            disabled={loading || isLoading}
            className="w-full h-12 bg-[#09090B] hover:bg-[#09090B]/90 text-white font-semibold text-sm rounded-[10px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Signed in
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        className="relative my-6"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={6}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E4E4E7]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#A1A1AA]">or</span>
        </div>
      </motion.div>

      {/* Google OAuth */}
      <motion.div variants={stagger} initial="hidden" animate="show" custom={7}>
        <button
          type="button"
          onClick={() => authService.initiateGoogleLogin()}
          disabled={loading || isLoading}
          className="w-full h-12 bg-white border border-[#E4E4E7] text-[#09090B] font-medium text-sm rounded-[10px] hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </motion.div>

      {/* Bottom link */}
      <motion.p
        className="text-sm text-[#52525B] mt-8"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={8}
      >
        No account?{' '}
        <Link href="/register" className="text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors">
          Create one
        </Link>
      </motion.p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthSplitLayout leftPanel={<LeftPanel />}>
        <LoginForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
