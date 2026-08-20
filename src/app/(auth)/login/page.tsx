"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/authService";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { DemoLoginCard } from "@/components/demo/DemoBanner";

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
function OAuthButtons({ loading, action, oauthError, onClearOAuthError }: { loading: boolean; action: "Sign up" | "Continue"; oauthError: string | null; onClearOAuthError: () => void }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    onClearOAuthError();
    try {
      await authService.initiateGoogleLogin();
    } catch {
      setGoogleLoading(false);
    }
  };

  const handleGitHub = async () => {
    setGithubLoading(true);
    onClearOAuthError();
    try {
      await authService.initiateGitHubLogin();
    } catch {
      setGithubLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#F8F9FA] disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleIcon />}
        {googleLoading ? `Connecting to Google...` : `${action} with Google`}
      </button>
      <button
        type="button"
        onClick={handleGitHub}
        disabled={loading || githubLoading}
        className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#F8F9FA] disabled:opacity-50"
      >
        {githubLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GitHubIcon />}
        {githubLoading ? `Connecting to GitHub...` : `${action} with GitHub`}
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
        <span className="bg-white px-3 text-[11px] text-[#A1A1AA]">{label}</span>
      </div>
    </div>
  );
}

// ── Error Alert ─────────────────────────────────────────────────────────
function ErrorAlert({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <p className="text-[13px] leading-snug text-red-700">{message}</p>
    </motion.div>
  );
}

// ── Login Form ───────────────────────────────────────────────────────────
function LoginForm() {
  const { login, loginError, clearErrors, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState(false);

  // Sync with auth context errors
  if (loginError && !error) setError(loginError);
  if (!loginError && error && error === loginError) setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : null;
      if (msg?.includes("not verified") || msg?.includes("EMAIL_NOT_VERIFIED")) {
        setError("Your email has not been verified.");
      } else if (msg?.includes("invalid credentials") || msg?.includes("INVALID_CREDENTIALS")) {
        setError("Incorrect email or password.");
      } else if (msg?.includes("rate limit") || msg?.includes("RATE_LIMIT") || msg?.includes("too many")) {
        setError("Too many sign-in attempts. Please wait before trying again.");
      } else if (msg?.includes("network") || msg?.includes("Network") || !msg) {
        setError("Unable to reach Reliastra. Check your connection and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@reliastra.design");
    setPassword("demo");
    setDemoHint(true);
    setTimeout(() => setDemoHint(false), 2500);
  };

  const isSubmitting = loading || isLoading;

  return (
    <AuthCard>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
          Sign in to Reliastra
        </h1>
        <p className="mt-1.5 text-[13px] text-[#71717A]">
          Access your dependency intelligence console.
        </p>
      </div>

      {/* Demo workspace — no backend required */}
      <DemoLoginCard />

      <Divider label="or sign in with real account" />

      <OAuthButtons loading={isSubmitting} action="Continue" oauthError={oauthError} onClearOAuthError={() => setOAuthError(null)} />
      <Divider label="or continue with email" />

      {error && <ErrorAlert message={error} />}
      {error?.includes("not been verified") && (
        <Link
          href="/register"
          className="block mb-4 text-center text-[12px] font-medium text-[#0891B2] transition-colors hover:text-[#0E7490]"
        >
          Resend verification
        </Link>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="email" className="block text-[13px] font-medium text-[#09090B]">
              Email
            </label>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[11px] font-medium text-[#0891B2] hover:text-[#0E7490] transition-colors"
            >
              Use demo account →
            </button>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="h-[42px] border-[#E4E4E7] bg-white text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]"
          />
          {demoHint && (
            <p className="mt-1.5 text-[11px] text-[#0891B2] font-medium">Filled demo credentials — press Sign in</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-[#09090B]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-[#0891B2] transition-colors hover:text-[#0E7490]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="h-[42px] border-[#E4E4E7] bg-white pr-10 text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors hover:text-[#52525B]"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#A1A1AA]">
            Demo: <span className="font-mono text-[#52525B]">demo@reliastra.design / demo</span> works offline — no backend needed.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#71717A]">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#0891B2] transition-colors hover:text-[#0E7490]"
        >
          Create one
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] text-[#A1A1AA]">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[#52525B]">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-[#52525B]">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[#0891B2]" />
          </div>
        </AuthCard>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
