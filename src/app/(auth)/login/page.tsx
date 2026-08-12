"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[#2A2D3A] bg-[#1A1D27] p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[#F1F5F9]">Reliastra</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 bg-[#0F1117] border-[#2A2D3A] text-[#F1F5F9] placeholder:text-[#64748B]"
            />
          </div>
          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-11 bg-[#0F1117] border-[#2A2D3A] text-[#F1F5F9] placeholder:text-[#64748B]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#6366F1] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
