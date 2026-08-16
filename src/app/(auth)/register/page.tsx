"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/authService";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { AlertCircle, AlertTriangle, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Password Strength ─────────────────────────────────────────────────────

const PASSWORD_CHECKS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
] as const;

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "", color: "" };
  const met = PASSWORD_CHECKS.filter((c) => c.test(password)).length;
  if (met <= 1) return { level: 1, label: "Weak", color: "#DC2626" };
  if (met <= 2) return { level: 2, label: "Fair", color: "#D97706" };
  if (met <= 3) return { level: 3, label: "Good", color: "#0891B2" };
  return { level: 4, label: "Strong", color: "#16A34A" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const [expanded, setExpanded] = useState(false);
  const inputFocused = useRef(false);

  useEffect(() => {
    if (password && !inputFocused.current) {
      inputFocused.current = true;
      setExpanded(true);
    }
  }, [password]);

  if (!password) return null;

  const { level, label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= level ? color : "#E4E4E7" }}
          />
        ))}
      </div>
      <p className="text-xs mt-1.5" style={{ color }}>
        Password strength: {label}
      </p>

      {/* Requirements checklist (expanded) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1.5">
              {PASSWORD_CHECKS.map((check) => {
                const met = check.test(password);
                return (
                  <div key={check.label} className="flex items-center gap-2">
                    {met ? (
                      <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-[#A1A1AA]" />
                    )}
                    <span
                      className={cn(
                        "text-xs transition-colors duration-200",
                        met ? "text-[#16A34A]" : "text-[#A1A1AA]"
                      )}
                    >
                      {check.label}
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

// ── Generic Domain Detector ───────────────────────────────────────────────

const GENERIC_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com"];

function isGenericDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && GENERIC_DOMAINS.includes(domain);
}

// ── Shake Animation ───────────────────────────────────────────────────────

function shakeOnError(shake: boolean) {
  return shake
    ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
    : {};
}

// ── Google SVG ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── GitHub SVG ─────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ── OAuth Buttons ───────────────────────────────────────────────────────

function OAuthButtons({ loading }: { loading: boolean }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [oauthError, setOAuthError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setOAuthError(null);
    try {
      await authService.initiateGoogleLogin();
    } catch {
      setGoogleLoading(false);
      setOAuthError("Google sign-in could not be started. Try again.");
    }
  };

  const handleGitHub = async () => {
    setGithubLoading(true);
    setOAuthError(null);
    try {
      await authService.initiateGitHubLogin();
    } catch {
      setGithubLoading(false);
      setOAuthError("GitHub sign-in could not be started. Try again.");
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white text-[15px] font-medium text-[#09090B] transition-all hover:bg-[#F8F9FA] disabled:opacity-50"
        aria-label="Sign up with Google"
      >
        {googleLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleIcon />}
        {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
      </button>
      <button
        type="button"
        onClick={handleGitHub}
        disabled={loading || githubLoading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white text-[15px] font-medium text-[#09090B] transition-all hover:bg-[#F8F9FA] disabled:opacity-50"
        aria-label="Sign up with GitHub"
      >
        {githubLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GitHubIcon />}
        {githubLoading ? "Connecting to GitHub..." : "Sign up with GitHub"}
      </button>
      {oauthError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-[12px] leading-snug text-red-700">{oauthError}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E4E4E7]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs text-[#A1A1AA]">{label}</span>
      </div>
    </div>
  );
}

// ── Founding Customer Program ────────────────────────────────────────────

function FoundingProgram() {
  const filled = 8;
  const total = 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-6 p-4 bg-[#F8F9FA] rounded-xl border border-[#E4E4E7]"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#0891B2]">
        Founding Customer Program
      </p>
      <p className="text-sm text-[#52525B] mt-1">
        Lock your rate forever. <span className="font-semibold">{total - filled} of {total} spots remaining.</span>
      </p>

      {/* Progress dots */}
      <div className="flex gap-1 mt-3 flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              i < filled ? "bg-[#0891B2]" : "bg-[#E4E4E7]"
            )}
            style={i < filled ? { animation: "pulse-dot 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` } : {}}
          />
        ))}
      </div>

      <p className="text-xs text-[#A1A1AA] mt-2">
        Join the first 25 customers and your price never increases.
      </p>

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
          }
        }
      `}</style>
    </motion.div>
  );
}

// ── Register Form ────────────────────────────────────────────────────────

function RegisterForm() {
  const { register, registerError, clearErrors, isLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeName, setShakeName] = useState(false);
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync with auth context errors
  useEffect(() => {
    if (registerError && !error) setError(registerError);
    if (!registerError && error && error === registerError) setError(null);
  }, [registerError, error]);

  const showEmailWarning = email.includes("@") && isGenericDomain(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();

    let hasError = false;

    if (!fullName.trim()) {
      setShakeName(true);
      setNameTouched(true);
      setTimeout(() => setShakeName(false), 400);
      hasError = true;
    }
    if (!email.trim()) {
      setShakeEmail(true);
      setEmailTouched(true);
      setTimeout(() => setShakeEmail(false), 400);
      hasError = true;
    }
    if (!password) {
      setShakePassword(true);
      setPasswordTouched(true);
      setTimeout(() => setShakePassword(false), 400);
      hasError = true;
    }

    if (hasError) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, orgName.trim() || undefined);
      setSuccess(true);
      setTimeout(() => {
        router.push("/verify-email");
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : null;
      if (msg?.includes("already exists") || msg?.includes("EMAIL_ALREADY_REGISTERED")) {
        setError("An account with this email already exists.");
      } else if (msg?.includes("password") || msg?.includes("PASSWORD_") || msg?.includes("security rules")) {
        setError("Password does not meet the required security rules.");
      } else if (msg?.includes("rate limit") || msg?.includes("RATE_LIMIT") || msg?.includes("too many")) {
        setError("Too many registration attempts. Please wait before trying again.");
      } else if (msg?.includes("network") || msg?.includes("Network") || !msg) {
        setError("Unable to reach Reliastra. Check your connection and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || isLoading;

  return (
    <AuthCard>
      {/* Headline */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#09090B] leading-tight">
          Create your Reliastra workspace
        </h1>
        <p className="mt-2 text-base text-[#52525B]">
          Build an independent reliability record for the infrastructure you operate.
        </p>
      </div>

      {/* OAuth */}
      <OAuthButtons loading={isSubmitting} />
      <Divider label="or register with email" />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-[13px] leading-snug text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <motion.div {...shakeOnError(shakeName)}>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[#09090B]">
            Full name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            aria-label="Full name"
            aria-invalid={nameTouched && !fullName.trim() ? "true" : "false"}
            aria-describedby={nameTouched && !fullName.trim() ? "name-error" : undefined}
            className={cn(
              "w-full h-12 px-4 rounded-[10px] border text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2]",
              nameTouched && !fullName.trim()
                ? "border-[#DC2626]"
                : "border-[#E4E4E7]"
            )}
          />
          {nameTouched && !fullName.trim() && (
            <p id="name-error" className="mt-1 text-xs text-[#DC2626]">Full name is required.</p>
          )}
        </motion.div>

        {/* Work Email */}
        <motion.div {...shakeOnError(shakeEmail)}>
          <label htmlFor="regEmail" className="mb-1.5 block text-sm font-medium text-[#09090B]">
            Work email <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="regEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            aria-label="Work email"
            aria-invalid={emailTouched && !email.trim() ? "true" : "false"}
            aria-describedby={emailTouched && !email.trim() ? "email-error" : undefined}
            className={cn(
              "w-full h-12 px-4 rounded-[10px] border text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2]",
              emailTouched && !email.trim()
                ? "border-[#DC2626]"
                : "border-[#E4E4E7]"
            )}
          />
          {emailTouched && !email.trim() && (
            <p id="email-error" className="mt-1 text-xs text-[#DC2626]">Work email is required.</p>
          )}
          {showEmailWarning && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mt-1.5 text-xs text-[#D97706]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Personal email detected. Work emails get priority support.
            </motion.div>
          )}
        </motion.div>

        {/* Organization Name */}
        <div>
          <label htmlFor="orgName" className="mb-1.5 block text-sm font-medium text-[#09090B]">
            Organization name
          </label>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your company (optional)"
            autoComplete="organization"
            aria-label="Organization name"
            className="w-full h-12 px-4 rounded-[10px] border border-[#E4E4E7] text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2] transition-all"
          />
          <p className="text-xs text-[#A1A1AA] mt-1.5">
            Leave blank to use your name as the default organization.
          </p>
        </div>

        {/* Password */}
        <motion.div {...shakeOnError(shakePassword)}>
          <label htmlFor="regPassword" className="mb-1.5 block text-sm font-medium text-[#09090B]">
            Password <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <input
              id="regPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              aria-label="Password"
              aria-invalid={passwordTouched && !password ? "true" : "false"}
              aria-describedby={passwordTouched && !password ? "password-error" : undefined}
              className={cn(
                "w-full h-12 px-4 pr-12 rounded-[10px] border text-[15px] text-[#09090B] placeholder:text-[#A1A1AA] transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[#0891B2] focus:ring-offset-2 focus:border-[#0891B2]",
                passwordTouched && !password
                  ? "border-[#DC2626]"
                  : "border-[#E4E4E7]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors hover:text-[#52525B]"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordTouched && !password && (
            <p id="password-error" className="mt-1 text-xs text-[#DC2626]">Password is required.</p>
          )}
          <PasswordStrengthBar password={password} />
        </motion.div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full h-12 rounded-[10px] font-semibold text-[15px] transition-all",
            "hover:translate-y-[-1px] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
            success
              ? "bg-[#16A34A] text-white"
              : "bg-[#0A0A0F] text-white hover:bg-neutral-800"
          )}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating your account...
            </span>
          ) : success ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Account created
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-xs text-[#A1A1AA] text-center leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-[#0891B2] hover:text-[#0E7490] underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#0891B2] hover:text-[#0E7490] underline">Privacy Policy</Link>.
      </p>

      {/* Sign in link */}
      <p className="mt-6 text-sm text-[#52525B] text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0891B2] font-medium hover:text-[#0E7490] transition-colors">
          Sign in
        </Link>
      </p>

      {/* Founding Customer Program */}
      <FoundingProgram />
    </AuthCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0891B2]" />
          </div>
        </AuthCard>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
