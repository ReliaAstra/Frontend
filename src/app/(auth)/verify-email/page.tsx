"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { BackendError } from "@/lib/api";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

type VerifyState = "verifying" | "verified" | "already_verified" | "expired" | "invalid" | "error";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyState>(token ? "verifying" : "invalid");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    token ? null : "No verification token found in URL.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const doVerify = async () => {
      try {
        const result = await authService.verifyEmail(token);
        if (cancelled) return;
        if (result.is_email_verified) {
          setStatus("verified");
        } else {
          setStatus("error");
          setErrorMsg("Verification failed. Please try again.");
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof BackendError) {
          const code = err.code;
          if (code === "TOKEN_EXPIRED") {
            setStatus("expired");
          } else if (code === "TOKEN_ALREADY_USED") {
            setStatus("already_verified");
          } else if (code === "INVALID_TOKEN") {
            setStatus("invalid");
          } else {
            setStatus("error");
            setErrorMsg(err.message || "Verification failed.");
          }
        } else {
          setStatus("error");
          setErrorMsg("Unable to verify your email. Please check your connection and try again.");
        }
      }
    };

    doVerify();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <AuthCard>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center"
      >
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA]">
              <Loader2 className="h-5 w-5 animate-spin text-[#0891B2]" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Verifying your email...
            </h1>
            <p className="mt-2 text-[13px] text-[#71717A]">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === "verified" && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Email verified
            </h1>
            <p className="mt-2 text-[13px] text-[#71717A]">
              Your email is verified. Your Reliastra workspace is ready.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
              >
                <Link href="/login">Continue to Reliastra</Link>
              </Button>
            </div>
          </>
        )}

        {status === "already_verified" && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Already verified
            </h1>
            <p className="mt-2 text-[13px] text-[#71717A]">
              Your email has already been verified. You can sign in to your account.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <XCircle className="h-5 w-5 text-amber-500" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Link expired
            </h1>
            <p className="mt-2 text-[13px] text-[#71717A]">
              This verification link has expired. Please request a new one from your account settings.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </>
        )}

        {(status === "invalid" || status === "error") && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">
              Verification failed
            </h1>
            <p className="mt-2 text-[13px] text-[#71717A]">
              {errorMsg || "The verification link is invalid. Please request a new one."}
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-[42px] w-full rounded-lg bg-[#09090B] text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </AuthCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
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
      <VerifyEmailForm />
    </Suspense>
  );
}
