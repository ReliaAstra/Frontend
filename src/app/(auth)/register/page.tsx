'use client';

import { useState, useCallback, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { IncidentCardLoop } from '@/components/auth/IncidentCardLoop';
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

const PERSONAL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com'];

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
          Build an independent reliability record for the infrastructure you operate.
        </p>
      </div>
      <AuthVendorGrid />
      <IncidentCardLoop />
      {/* Testimonial */}
      <div className="bg-[#131318] rounded-xl p-4 border border-white/5 w-full">
        <p className="text-sm text-white/70 leading-relaxed italic">
          &ldquo;We recovered $4,200 in SLA credits in our first month. The evidence reports are bulletproof.&rdquo;
        </p>
        <p className="text-xs text-white/40 mt-2">— Sarah Chen, VP Engineering at Datastream</p>
      </div>
    </div>
  );
}

function RegisterForm() {
  const { register, registerError, clearErrors, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personalEmailWarning, setPersonalEmailWarning] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (registerError) setToastError(registerError);
  }, [registerError]);

  const dismissToast = useCallback(() => setToastError(null), []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const domain = val.split('@')[1]?.toLowerCase();
    setPersonalEmailWarning(!!domain && PERSONAL_DOMAINS.includes(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setToastError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setToastError('Password must be at least 8 characters.');
      return;
    }
    clearErrors();
    setToastError(null);
    setLoading(true);
    try {
      await register(fullName, email, password, orgName || undefined);
    } catch {
      // Error handled via context -> toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <AuthToast message={toastError} onDismiss={dismissToast} />

      <motion.h1
        className="text-[28px] font-bold text-[#09090B] tracking-[-0.02em] mb-2"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={0}
      >
        Create your Reliastra account
      </motion.h1>
      <motion.p
        className="text-base font-normal text-[#52525B] mb-8"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={1}
      >
        Build an independent reliability record for the infrastructure you operate.
      </motion.p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <motion.div className="mb-4" variants={stagger} initial="hidden" animate="show" custom={2}>
          <label htmlFor="reg-fullname" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Full name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="reg-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            className={inputClass}
          />
        </motion.div>

        {/* Work email */}
        <motion.div className="mb-4" variants={stagger} initial="hidden" animate="show" custom={3}>
          <label htmlFor="reg-email" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Work email <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            aria-invalid={personalEmailWarning}
            aria-describedby={personalEmailWarning ? 'reg-email-warning' : undefined}
            className={inputClass}
          />
          {personalEmailWarning && (
            <div id="reg-email-warning" className="flex items-center gap-1.5 mt-1.5" role="alert">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="text-xs text-[#D97706]">
                This looks like a personal email. Work emails are recommended for team features.
              </span>
            </div>
          )}
        </motion.div>

        {/* Organization name */}
        <motion.div className="mb-4" variants={stagger} initial="hidden" animate="show" custom={4}>
          <label htmlFor="reg-org" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Organization name
          </label>
          <input
            id="reg-org"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your company (optional)"
            className={inputClass}
          />
          <p className="text-xs text-[#A1A1AA] mt-1">
            Leave blank to use your name as the default organization.
          </p>
        </motion.div>

        {/* Password */}
        <motion.div className="mb-6" variants={stagger} initial="hidden" animate="show" custom={5}>
          <label htmlFor="reg-password" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Password <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          <PasswordStrength password={password} focused={passwordFocused} />
        </motion.div>

        {/* CTA */}
        <motion.div variants={stagger} initial="hidden" animate="show" custom={6}>
          <button
            type="submit"
            disabled={loading || isLoading}
            className="w-full h-12 bg-[#09090B] hover:bg-[#09090B]/90 text-white font-semibold text-sm rounded-[10px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </motion.div>
      </form>

      {/* Terms microcopy */}
      <motion.p
        className="text-xs text-[#A1A1AA] mt-5"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={7}
      >
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-[#52525B] transition-colors">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-[#52525B] transition-colors">Privacy Policy</Link>.
      </motion.p>

      {/* Bottom link */}
      <motion.p
        className="text-sm text-[#52525B] mt-5"
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={8}
      >
        Already have an account?{' '}
        <Link href="/login" className="text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors">
          Sign in
        </Link>
      </motion.p>
    </Fragment>
  );
}

export default function RegisterPage() {
  return (
    <AuthSplitLayout leftPanel={<LeftPanel />}>
      <RegisterForm />
    </AuthSplitLayout>
  );
}
