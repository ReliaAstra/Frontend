"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// ── Form State ───────────────────────────────────────────────────────────

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      // Anti-enumeration: always show success regardless of backend response
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      // Even on error, show generic success (anti-enumeration)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {sent ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
            Check your email
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#71717A]">
            If an account with{" "}
            <span className="font-medium text-[#09090B]">{email}</span> exists,
            we&apos;ve sent instructions to reset your password.
          </p>
          <div className="mt-8 space-y-3">
            <Button
              asChild
              className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
            >
              <Link href="/login">Return to sign in</Link>
            </Button>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="block w-full text-center text-[12px] font-medium text-[#0891B2] transition-colors hover:text-[#0E7490]"
            >
              Try a different email address
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Reset your password
            </h1>
            <p className="mt-1.5 text-[13px] text-[#71717A]">
              Enter your email and we&apos;ll send instructions if an account exists.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5"
            >
              <p className="text-[13px] text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
                Email address
              </label>
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset instructions...
                </span>
              ) : (
                "Send reset instructions"
              )}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#71717A] transition-colors hover:text-[#09090B]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </>
      )}
    </AuthCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />
    </Suspense>
  );
}
