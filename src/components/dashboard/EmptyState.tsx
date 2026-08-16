"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "success";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-10 text-center">
      <div
        className={`mx-auto mb-4 w-16 h-16 rounded-xl flex items-center justify-center ${
          variant === "success"
            ? "bg-[rgba(22,163,74,0.12)]"
            : "bg-[rgba(255,255,255,0.05)]"
        }`}
      >
        <Icon
          className={`w-8 h-8 ${
            variant === "success" ? "text-[#16A34A]" : "text-[#52525B]"
          }`}
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-semibold text-[#FAFAFA]">{title}</h3>
      <p className="text-sm text-[#A1A1AA] mt-2 max-w-md mx-auto">{description}</p>
      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-lg transition-all"
            >
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-lg transition-all"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
