'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { AnimatedCounter } from '@/components/auth/AnimatedCounter';
import { AuthToast } from '@/components/auth/AuthToast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Loader2, CheckCircle2 } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

function LeftPanelContent() {
  return (
    <>
      <AuthVendorGrid />
      <AnimatedCounter
        target={12847}
        duration={1500}
        className="text-2xl font-bold text-white mt-6 block"
      />
      <span className="text-sm text-white/40 mt-1 block">
        incidents correlated this month
      </span>
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

function LoginForm() {
  const { login, loginError, clearErrors, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Field-level validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync auth context errors to toast
  useEffect(() => {
    if (loginError) {
      setToastMessage(loginError);
      setToastVisible(true);
      // Auto-dismiss after 5s
      const timer = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : 'Please enter a valid email address.';
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const err = validateEmail(email);
    setEmailError(err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validate
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailTouched(true);
      setEmailError(emailErr);
      return;
    }
    if (!password) {
      setToastMessage('Please enter your password.');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      // Auth context handles redirect
    } catch {
      // Error handled by auth context → toast
    } finally {
      if (!success) setLoading(false);
    }
  };

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <>
      <AuthToast message={toastMessage} visible={toastVisible} onDismiss={dismissToast} />

      <AuthSplitLayout leftPanelExtra={<LeftPanelContent />}>
        {/* Headline */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease }}
        >
          <h1 className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] leading-[1.2]">
            Sign in to Reliastra
          </h1>
          <p className="text-[16px] text-[#52525B] mt-2 leading-[1.6]">
            Access your dependency intelligence console.
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
              htmlFor="login-email"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailTouched) setEmailError(validateEmail(e.target.value));
                }}
                onBlur={handleEmailBlur}
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={emailTouched && !!emailError}
                aria-describedby={emailError ? 'login-email-error' : undefined}
                className={`w-full h-12 px-4 pr-10 rounded-[10px] border bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150 ${
                  emailTouched && emailError
                    ? 'border-[#DC2626]'
                    : 'border-[#E4E4E7]'
                }`}
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
            </div>
            {emailTouched && emailError && (
              <motion.p
                id="login-email-error"
                role="alert"
                className="text-[13px] text-[#DC2626] mt-1.5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.15 }}
              >
                {emailError}
              </motion.p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            custom={1}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <label
              htmlFor="login-password"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
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
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#0891B2] hover:text-[#0E7490] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </motion.div>

          {/* Remember me */}
          <motion.div
            custom={2}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
            className="flex items-center gap-2"
          >
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#E4E4E7] accent-[#0891B2] cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-sm text-[#52525B] cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div
            custom={3}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <button
              type="submit"
              disabled={loading || isLoading || success}
              className="w-full h-12 bg-[#0A0A0F] text-white rounded-[10px] font-semibold text-[15px] hover:bg-neutral-800 hover:-translate-y-px hover:shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
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

          {/* Divider */}
          <motion.div
            custom={4}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
            className="flex items-center gap-3"
          >
            <div className="flex-1 border-t border-[#F0F0F0]" />
            <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-[#F0F0F0]" />
          </motion.div>

          {/* Google OAuth */}
          <motion.div
            custom={5}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <button
              type="button"
              onClick={() => {
                // Will be wired to authService.initiateGoogleLogin() when backend supports
                window.location.href = '/api/auth/google';
              }}
              disabled={loading || isLoading}
              className="w-full h-12 bg-white text-[#09090B] border border-[#E4E4E7] rounded-[10px] font-medium text-[15px] hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Bottom link */}
          <motion.p
            custom={6}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
            className="text-center text-sm text-[#52525B] pt-2"
          >
            No account?{' '}
            <Link
              href="/register"
              className="text-[#0891B2] font-medium hover:text-[#0E7490] transition-colors"
            >
              Create one
            </Link>
          </motion.p>
        </form>
      </AuthSplitLayout>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
