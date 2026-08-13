"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authService } from "@/services/authService";
import { Loader2 } from "lucide-react";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider"); // "google" or "github"

  useEffect(() => {
    const completeOAuth = async () => {
      try {
        const result =
          provider === "github"
            ? await authService.handleGitHubCallback()
            : await authService.handleGoogleCallback();

        // Store JWT tokens
        localStorage.setItem("reliastra_access_token", result.access_token);
        localStorage.setItem("reliastra_refresh_token", result.refresh_token);

        // Route based on whether this is a new user
        if (result.is_new_user) {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("OAuth callback failed:", error);
        router.push("/login?error=oauth_failed");
      }
    };

    completeOAuth();
  }, [provider, router]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0891B2] mx-auto mb-4" />
        <p className="text-sm text-[#52525B]">Completing sign-in...</p>
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
