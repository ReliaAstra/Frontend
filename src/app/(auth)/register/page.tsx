'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthVendorGrid } from '@/components/auth/AuthVendorGrid';
import { IncidentCardLoop } from '@/components/auth/IncidentCardLoop';
import { AuthToast } from '@/components/auth/AuthToast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Loader2, CheckCircle2, Check, Circle,
  AlertTriangle,
} from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

/* ── Left Panel: Vendor Grid + Testimonial ────────────────── */

function LeftPanelContent() {
  return (
    <>
      <AuthVendorGrid />
      <IncidentCardLoop />
      <div className="bg-[#131318] rounded-xl p-5 border border-white/5 mt-4">
        <p className="text-[13px] text-white/70 italic leading-relaxed">
          &ldquo;We recovered $4,200 in SLA credits in our first month. The evidence reports are bulletproof.&rdquo;
        </p>
        <p className="text-[11px] text-white/30 mt-3">
          — Sarah Chen, VP Engineering at Datastream
        </p>
      </div>
    </>
  );
}

/* ── Password Strength ─────────────────────────────────────── */

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

function PasswordStrengthIndicator({ password, focused }: { password: string; focused: boolean }) {
  const strength = getStrength(password);

  return (
    <div className="mt-2">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < strength.level ? strength.color : '#E4E4E7',
            }}
          />
        ))}
      </div>

      {/* Label */}
      {password && strength.label && (
        <p className="text-xs mt-1.5" style={{ color: strength.color }}>
          Password strength: {strength.label}
        </p>
      )}

      {/* Checklist (appears on focus) */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

/* ── Personal email detection ──────────────────────────────── */

const PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com',
  'yandex.com', 'live.com', 'msn.com',
];

function isPersonalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? PERSONAL_DOMAINS.includes(domain) : false;
}

/* ── Form Field Variants ───────────────────────────────────── */

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.3 + i * 0.08, ease },
  }),
};

/* ── Register Form ─────────────────────────────────────────── */

function RegisterForm() {
  const { register, registerError, clearErrors, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Field-level validation
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (registerError) {
      setToastMessage(registerError);
      setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [registerError]);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const validateEmail = (value: string) => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : 'Please enter a valid email address.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validate required fields
    let hasError = false;

    if (!fullName.trim()) {
      setNameTouched(true);
      setNameError('Full name is required.');
      hasError = true;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailTouched(true);
      setEmailError(emailErr);
      hasError = true;
    }

    if (!email) {
      setEmailTouched(true);
      setEmailError('Work email is required.');
      hasError = true;
    }

    if (password.length < 8) {
      setToastMessage('Password must be at least 8 characters.');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await register(fullName.trim(), email, password, orgName.trim() || undefined);
      setSuccess(true);
    } catch {
      // Error handled by auth context
    } finally {
      if (!success) setLoading(false);
    }
  };

  const showPersonalEmailWarning = email.length > 3 && isPersonalEmail(email);

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
            Create your Reliastra account
          </h1>
          <p className="text-[16px] text-[#52525B] mt-2 leading-[1.6]">
            Build an independent reliability record for the infrastructure you operate.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full name */}
          <motion.div
            custom={0}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <label
              htmlFor="reg-name"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
              Full name <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameTouched) setNameError(e.target.value.trim() ? null : 'Full name is required.');
              }}
              onBlur={() => {
                setNameTouched(true);
                setNameError(fullName.trim() ? null : 'Full name is required.');
              }}
              placeholder="Jane Smith"
              autoComplete="name"
              aria-invalid={nameTouched && !!nameError}
              aria-describedby={nameError ? 'reg-name-error' : undefined}
              className={`w-full h-12 px-4 rounded-[10px] border bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150 ${
                nameTouched && nameError ? 'border-[#DC2626]' : 'border-[#E4E4E7]'
              }`}
            />
            {nameTouched && nameError && (
              <motion.p
                id="reg-name-error"
                role="alert"
                className="text-[13px] text-[#DC2626] mt-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {nameError}
              </motion.p>
            )}
          </motion.div>

          {/* Work email */}
          <motion.div
            custom={1}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <label
              htmlFor="reg-email"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
              Work email <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-email"
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
                aria-describedby={emailError ? 'reg-email-error' : undefined}
                className={`w-full h-12 px-4 pr-10 rounded-[10px] border bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150 ${
                  emailTouched && emailError ? 'border-[#DC2626]' : 'border-[#E4E4E7]'
                }`}
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
            </div>
            {emailTouched && emailError && (
              <motion.p
                id="reg-email-error"
                role="alert"
                className="text-[13px] text-[#DC2626] mt-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {emailError}
              </motion.p>
            )}
            {/* Personal email warning */}
            {showPersonalEmailWarning && !emailError && (
              <motion.div
                className="flex items-center gap-1.5 mt-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span className="text-xs text-[#D97706]">
                  Personal email detected. Work emails get priority support.
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Organization */}
          <motion.div
            custom={2}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <label
              htmlFor="reg-org"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
              Organization name
            </label>
            <input
              id="reg-org"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Your company (optional)"
              autoComplete="organization"
              className="w-full h-12 px-4 rounded-[10px] border border-[#E4E4E7] bg-white text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 transition-all duration-150"
            />
            <p className="text-xs text-[#A1A1AA] mt-1">
              Leave blank to use your name as the default organization.
            </p>
          </motion.div>

          {/* Password */}
          <motion.div
            custom={3}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
          >
            <label
              htmlFor="reg-password"
              className="block text-[13px] font-medium text-[#09090B] mb-1.5 leading-[1.4]"
            >
              Password <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-password"
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

          {/* Submit */}
          <motion.div
            custom={4}
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
                  Account created
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </motion.div>

          {/* Terms */}
          <motion.p
            custom={5}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
            className="text-xs text-[#A1A1AA] text-center"
          >
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#0891B2] hover:text-[#0E7490] transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#0891B2] hover:text-[#0E7490] transition-colors">
              Privacy Policy
            </Link>.
          </motion.p>

          {/* Bottom link */}
          <motion.p
            custom={6}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            variants={fieldVariants}
            className="text-center text-sm text-[#52525B] pt-2"
          >
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#0891B2] font-medium hover:text-[#0E7490] transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </form>
      </AuthSplitLayout>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
