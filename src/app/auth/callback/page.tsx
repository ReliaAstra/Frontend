"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authService } from "@/services/authService";
import { Loader2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type CallbackState = "processing" | "error" | "state_mismatch" | "no_code";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const [state, setState] = useState<CallbackState>("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const completeOAuth = async () => {
      try {
        const result =
          provider === "github"
            ? await authService.handleGitHubCallback()
            : await authService.handleGoogleCallback();

        localStorage.setItem("reliastra_access_token", result.access_token);
        localStorage.setItem("reliastra_refresh_token", result.refresh_token);

        router.push("/dashboard");
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "";
        if (msg.includes("state mismatch") || msg.includes("CSRF")) {
          setState("state_mismatch");
        } else if (msg.includes("No authorization code")) {
          setState("no_code");
        } else {
          setState("error");
          setErrorMessage(msg || "Authentication failed.");
        }
      }
    };

    completeOAuth();
  }, [provider, router]);

  if (state === "processing") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0891B2] mx-auto mb-4" />
          <p className="text-sm text-[#52525B]">Completing sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          {state === "state_mismatch" ? (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        {state === "state_mismatch" && (
          <>
            <h1 className="text-lg font-semibold text-[#09090B]">Authentication security check</h1>
            <p className="mt-2 text-sm text-[#71717A]">
              The OAuth state parameter did not match. This may indicate a session issue.
              Please try signing in again.
            </p>
          </>
        )}

        {state === "no_code" && (
          <>
            <h1 className="text-lg font-semibold text-[#09090B]">No authorization code received</h1>
            <p className="mt-2 text-sm text-[#71717A]">
              The authentication provider did not return an authorization code.
              Please try signing in again.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-lg font-semibold text-[#09090B]">Authentication failed</h1>
            <p className="mt-2 text-sm text-[#71717A]">
              {errorMessage || "An error occurred during authentication."}
            </p>
          </>
        )}

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-[#09090B] py-2.5 text-center text-[13px] font-medium text-white transition-colors hover:bg-[#09090B]/90"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#0891B2] mx-auto mb-4" />
            <p className="text-sm text-[#52525B]">Completing sign-in...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
