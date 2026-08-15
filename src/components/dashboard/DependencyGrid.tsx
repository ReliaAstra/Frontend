"use client";

import { DependencyCard } from "./DependencyCard";
import type { Dependency } from "@/services/dependencyService";

interface DependencyGridProps {
  dependencies: Dependency[];
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
  togglingId?: string | null;
  deletingId?: string | null;
}

export function DependencyGrid({ dependencies, onToggle, onDelete, togglingId, deletingId }: DependencyGridProps) {
  if (dependencies.length === 0) {
    return (
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
        <p className="text-[#A1A1AA]">No dependencies found. Add your first dependency to start monitoring.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {dependencies.map((dep) => (
        <DependencyCard
          key={dep.id}
          dependency={dep}
          onToggle={onToggle}
          onDelete={onDelete}
          isToggling={togglingId === dep.id}
          isDeleting={deletingId === dep.id}
        />
      ))}
    </div>
  );
}
