"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { BackendError } from "@/lib/api";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type ResetState = "idle" | "submitting" | "success" | "error";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<ResetState>(token ? "idle" : "error");
  const [error, setError] = useState<string | null>(null);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      queueMicrotask(() =>
        setError("No reset token found in URL. Please request a new password reset link.")
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No reset token found.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setState("submitting");
    try {
      await authService.resetPassword(token, newPassword);
      setState("success");
    } catch (err) {
      setState("error");
      if (err instanceof BackendError) {
        const code = err.code;
        if (code === "INVALID_TOKEN") {
          setError("This reset link is invalid. Please request a new one.");
        } else if (code === "TOKEN_ALREADY_USED") {
          setError("This reset link has already been used. Please request a new one.");
        } else if (code === "TOKEN_EXPIRED") {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setError(err.message || "Failed to reset password. Please try again.");
        }
      } else {
        setError("Unable to connect to the server. Please check your connection and try again.");
      }
    }
  };

  return (
    <AuthCard>
      {state === "success" ? (
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
            Password updated
          </h1>
          <p className="mt-2 text-[13px] text-[#71717A]">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <div className="mt-8">
            <Button
              asChild
              className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Set new password
            </h1>
            <p className="mt-1.5 text-[13px] text-[#71717A]">
              Choose a strong password for your Reliastra account.
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
              <label htmlFor="newPassword" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
                New password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-medium text-[#09090B]">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                className="h-[42px] border-[#E4E4E7] bg-white text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">Passwords do not match.</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={state === "submitting"}
              className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
            >
              {state === "submitting" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating password...
                </span>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <Link
            href="/forgot-password"
            className="mt-6 block text-center text-[12px] font-medium text-[#71717A] transition-colors hover:text-[#09090B]"
          >
            Request a new reset link
          </Link>
        </>
      )}
    </AuthCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
