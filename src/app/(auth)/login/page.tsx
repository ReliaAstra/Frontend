"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, loginError, clearErrors, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(loginError);

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
    } catch {
      // Error handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-[#09090B] tracking-[-0.02em]">
          Sign in to Reliastra
        </h1>
        <p className="text-sm text-[#52525B] mt-1.5">
          Access your dependency intelligence console.
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
          <label htmlFor="email" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Email
          </label>
          <Input
            id="email"
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
          <label htmlFor="password" className="text-[13px] font-medium text-[#09090B] mb-1.5 block">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="h-[42px] bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] text-sm rounded-lg focus-visible:ring-[#0891B2] focus-visible:border-[#0891B2]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || isLoading}
          className="w-full h-[42px] bg-[#09090B] hover:bg-[#09090B]/90 text-white font-medium text-sm rounded-lg transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#52525B]">
          No account?{" "}
          <Link href="/register" className="text-[#0891B2] hover:text-[#0E7490] font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
