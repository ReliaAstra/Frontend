"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Check, X } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
  ];

  if (!password) return null;

  const allMet = checks.every((c) => c.met);

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-1.5">
          {check.met ? (
            <Check className="w-3 h-3 text-[#16A34A]" />
          ) : (
            <X className="w-3 h-3 text-[#A1A1AA]" />
          )}
          <span className={`text-xs ${check.met ? "text-[#16A34A]" : "text-[#A1A1AA]"}`}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { register, registerError, clearErrors, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(registerError);

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
      await register(fullName, email, password, orgName || undefined);
    } catch {
      // Error set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-[#09090B] tracking-[-0.02em]">
          Create your Reliastra account
        </h1>
        <p className="text-sm text-[#52525B] mt-1.5">
          Build an independent reliability record for the infrastructure you operate.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Full name <span className="text-[#DC2626]">*</span>
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            className="h-[42px] bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] text-sm rounded-lg focus-visible:ring-[#0891B2] focus-visible:border-[#0891B2]"
          />
        </div>
        <div>
          <label htmlFor="regEmail" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Work email <span className="text-[#DC2626]">*</span>
          </label>
          <Input
            id="regEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="h-[42px] bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] text-sm rounded-lg focus-visible:ring-[#0891B2] focus-visible:border-[#0891B2]"
          />
        </div>
        <div>
          <label htmlFor="orgName" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Organization name
          </label>
          <Input
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your company (optional)"
            className="h-[42px] bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] text-sm rounded-lg focus-visible:ring-[#0891B2] focus-visible:border-[#0891B2]"
          />
          <p className="text-xs text-[#A1A1AA] mt-1">
            Leave blank to use your name as the default organization.
          </p>
        </div>
        <div>
          <label htmlFor="regPassword" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Password <span className="text-[#DC2626]">*</span>
          </label>
          <Input
            id="regPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            className="h-[42px] bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] text-sm rounded-lg focus-visible:ring-[#0891B2] focus-visible:border-[#0891B2]"
          />
          <PasswordStrength password={password} />
        </div>

        <Button
          type="submit"
          disabled={loading || isLoading}
          className="w-full h-[42px] bg-[#09090B] hover:bg-[#09090B]/90 text-white font-medium text-sm rounded-lg transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-sm text-[#52525B] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-[#A1A1AA] mt-4">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[#52525B]">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-[#52525B]">Privacy Policy</Link>.
      </p>
    </div>
  );
}
