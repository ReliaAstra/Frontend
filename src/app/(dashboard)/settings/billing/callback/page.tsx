"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyPayment } from "@/hooks/useApi";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ConsoleCard, ConsoleCardBody } from "@/components/dashboard/ConsoleLayout";

export default function BillingCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const verifyPayment = useVerifyPayment();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    verifyPayment.mutateAsync(reference)
      .then((result) => {
        if (result.verified) {
          setStatus("success");
          // Redirect to settings after 3s
          setTimeout(() => router.push("/settings?tab=billing"), 3000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ConsoleCard className="w-full max-w-md">
        <ConsoleCardBody className="flex flex-col items-center py-8">
          {status === "verifying" && (
            <>
              <Loader2 className="w-10 h-10 text-[#0891B2] animate-spin mb-4" />
              <h2 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Verifying Payment...
              </h2>
              <p className="text-sm text-[#A1A1AA] text-center">
                Please wait while we confirm your payment with Paystack.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-10 h-10 text-[#16A34A] mb-4" />
              <h2 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Payment Successful!
              </h2>
              <p className="text-sm text-[#A1A1AA] text-center">
                Your plan has been upgraded. Redirecting to settings...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-10 h-10 text-[#DC2626] mb-4" />
              <h2 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Payment Verification Failed
              </h2>
              <p className="text-sm text-[#A1A1AA] text-center mb-4">
                We couldn't verify your payment. Please contact support or try again.
              </p>
              <button
                onClick={() => router.push("/settings?tab=billing")}
                className="px-4 py-2 rounded-lg bg-[#0891B2] text-white text-sm font-medium hover:bg-[#0891B2]/90 transition-colors"
              >
                Back to Settings
              </button>
            </>
          )}
        </ConsoleCardBody>
      </ConsoleCard>
    </div>
  );
}
