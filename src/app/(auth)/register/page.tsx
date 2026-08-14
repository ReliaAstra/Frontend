"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/authService";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";

// ── Password Strength ─────────────────────────────────────────────────────

const PASSWORD_CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
] as const;

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "" };
  const met = PASSWORD_CHECKS.filter((c) => c.test(password)).length;
  if (met === 0) return { level: 0, label: "Weak" };
  if (met < PASSWORD_CHECKS.length) return { level: 1, label: "Fair" };
  return { level: 2, label: "Strong" };
}

const STRENGTH_COLORS: Record<number, string> = {
  0: "bg-[#E4E4E7]",
  1: "bg-amber-400",
  2: "bg-emerald-500",
};

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { level } = getPasswordStrength(password);

  return (
    <div className="mt-2.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= level ? STRENGTH_COLORS[level] : "bg-[#E4E4E7]"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {PASSWORD_CHECKS.map((check) => {
          const met = check.test(password);
          return (
            <div key={check.label} className="flex items-center gap-1.5">
              {met ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <X className="h-3 w-3 text-[#A1A1AA]" />
              )}
              <span className={`text-[11px] ${met ? "text-emerald-600" : "text-[#A1A1AA]"}`}>
                {check.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── OAuth Buttons ───────────────────────────────────────────────────────
function OAuthButtons({ loading }: { loading: boolean }) {
  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => authService.initiateGoogleLogin()}
        disabled={loading}
        className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#F8F9FA] disabled:opacity-50"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </button>
      <button
        type="button"
        onClick={() => authService.initiateGitHubLogin()}
        disabled={loading}
        className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[13px] font-medium text-[#09090B] transition-colors hover:bg-[#F8F9FA] disabled:opacity-50"
      >
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        Sign up with GitHub
      </button>
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

// ── Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register, registerError, clearErrors, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (registerError && !error) setError(registerError);
  if (!registerError && error && error === registerError) setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
    } catch {
      // Error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || isLoading;

  return (
    <AuthCard>
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
          Create your Reliastra workspace
        </h1>
        <p className="mt-1.5 text-[13px] text-[#71717A]">
          Build an independent reliability record for the infrastructure you operate.
        </p>
      </div>

      <OAuthButtons loading={isSubmitting} />
      <Divider label="or register with email" />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-[13px] leading-snug text-red-700">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
            Full name <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            className="h-[42px] border-[#E4E4E7] bg-white text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]"
          />
        </div>

        <div>
          <label htmlFor="regEmail" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
            Work email <span className="text-red-500">*</span>
          </label>
          <Input
            id="regEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="h-[42px] border-[#E4E4E7] bg-white text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]"
          />
        </div>

        <div>
          <label htmlFor="regPassword" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="regPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
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
          <PasswordStrengthBar password={password} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#71717A]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0891B2] transition-colors hover:text-[#0E7490]"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] text-[#A1A1AA]">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[#52525B]">
          Terms of Service
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
