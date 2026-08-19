"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SearchX,
  Plus,
  FileText,
  KeyRound,
  Send,
  AlertTriangle,
  Link as LinkIcon,
  FileText as FileTextIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUiStore } from "@/lib/uiStore";
import { NAV_ITEMS, incidentRef, reportRef } from "./nav";
import { useDependencies, useIncidents, useEvidence } from "@/hooks/useApi";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  group: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  shortcut?: string;
  href?: string;
  onSelect?: () => void;
}

interface Group {
  label: string;
  items: Item[];
}

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const close = useUiStore((s) => s.closeCommandPalette);
  const recentPages = useUiStore((s) => s.recentPages);

  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const { data: dependencies = [] } = useDependencies();
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidence();

  // Global hotkey: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const store = useUiStore.getState();
        if (store.commandPaletteOpen) store.closeCommandPalette();
        else store.openCommandPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset query when opened
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const sendTestAlert = async () => {
    try {
      await apiClient.post("/notifications/test", {});
      toast.success("Test alert sent.");
    } catch {
      toast.error("Could not send test alert.");
    }
    close();
  };

  const groups: Group[] = [
    {
      label: "Navigate",
      items: NAV_ITEMS.map((item) => ({
        id: `nav-${item.href}`,
        group: "Navigate",
        icon: item.icon,
        label: item.label,
        href: item.href,
      })),
    },
    {
      label: "Quick actions",
      items: [
        {
          id: "action-add-dependency",
          group: "Quick actions",
          icon: Plus,
          label: "Add dependency",
          shortcut: "A",
          href: "/dependencies?new=1",
        },
        {
          id: "action-generate-report",
          group: "Quick actions",
          icon: FileTextIcon,
          label: "Generate report",
          shortcut: "R",
          href: "/incidents",
        },
        {
          id: "action-copy-api-key",
          group: "Quick actions",
          icon: KeyRound,
          label: "Copy API key",
          shortcut: "K",
          href: "/settings/security",
        },
        {
          id: "action-send-test-alert",
          group: "Quick actions",
          icon: Send,
          label: "Send test alert",
          shortcut: "T",
          onSelect: sendTestAlert,
        },
      ],
    },
    {
      label: "Recent",
      items: recentPages.map((page) => ({
        id: `recent-${page.href}`,
        group: "Recent",
        icon: page.icon === "incidents" ? AlertTriangle : page.icon === "dependencies" ? LinkIcon : FileTextIcon,
        label: page.label,
        href: page.href,
      })),
    },
  ];

  const q = query.trim().toLowerCase();

  let searchItems: Item[] = [];
  if (q) {
    const depMatches = dependencies
      .filter((d) => d.name.toLowerCase().includes(q) || d.endpoint_url.toLowerCase().includes(q))
      .slice(0, 5)
      .map((d) => ({
        id: `dep-${d.id}`,
        group: "Search results",
        icon: LinkIcon,
        label: d.name,
        hint: d.endpoint_url,
        href: `/dependencies/${d.id}`,
      }));
    const incMatches = incidents
      .filter((i) => (i.description || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((i) => ({
        id: `inc-${i.id}`,
        group: "Search results",
        icon: AlertTriangle,
        label: i.description || incidentRef(i.id),
        href: `/incidents/${i.id}`,
      }));
    const evMatches = evidence
      .filter((e) => e.id.toLowerCase().includes(q))
      .slice(0, 5)
      .map((e) => ({
        id: `ev-${e.id}`,
        group: "Search results",
        icon: FileTextIcon,
        label: reportRef(e.id),
        href: `/evidence/${e.id}`,
      }));
    searchItems = [...depMatches, ...incMatches, ...evMatches];
  }

  if (searchItems.length > 0) {
    groups.push({ label: "Search results", items: searchItems });
  }

  // Flatten for keyboard navigation (only selectable items).
  const visibleGroups = groups.filter((g) => g.items.length > 0);
  const flat: Item[] = visibleGroups.flatMap((g) => g.items);
  const clampedIndex = Math.min(activeIndex, Math.max(flat.length - 1, 0));

  const select = (item: Item) => {
    if (item.onSelect) item.onSelect();
    else if (item.href) router.push(item.href);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[clampedIndex]) select(flat[clampedIndex]);
    }
  };

  const highlight = (label: string, hint?: string) => {
    const text = `${label}${hint ? ` — ${hint}` : ""}`;
    if (!q) return { label, hint };
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return { label, hint };
    return { label, hint, matchStart: idx };
  };

  // Ensure the active item scrolls into view.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${clampedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [clampedIndex]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={close}
    >
      <div
        className="w-[640px] max-w-[90vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-[#1F2937]">
          <Search className="w-5 h-5 text-[#6B7280] ml-5 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search commands, dependencies, incidents..."
            className="flex-1 bg-transparent border-none outline-none text-base text-[#F9FAFB] placeholder:text-[#6B7280] py-4 px-3"
          />
          <span
            className="mr-4 rounded border border-[#374151] px-1.5 py-0.5 text-[#6B7280]"
            style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}
          >
            esc
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto rs-scroll py-1" ref={listRef}>
          {visibleGroups.length === 0 && (
            <div className="px-5 py-10 text-center">
              <SearchX className="w-8 h-8 text-[#374151] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#9CA3AF]">No results found</p>
              <p className="text-xs text-[#6B7280] mt-1">Try a different search term.</p>
            </div>
          )}

          {visibleGroups.map((group) => (
            <div key={group.label}>
              <div className="px-5 py-2 text-[11px] uppercase tracking-[0.05em] text-[#6B7280]">
                {group.label}
              </div>
              {group.items.map((item) => {
                runningIndex += 1;
                const index = runningIndex;
                const selected = index === clampedIndex;
                const Icon = item.icon;
                const hl = highlight(item.label, item.hint);

                return (
                  <button
                    key={item.id}
                    data-index={index}
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "w-full flex items-center px-5 py-2.5 text-left transition-colors",
                      selected ? "bg-[#1F2937]" : ""
                    )}
                    style={selected ? { boxShadow: "inset 2px 0 0 0 #3B82F6" } : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] text-[#6B7280] mr-3 shrink-0" />
                    <span className="text-sm text-[#F9FAFB] truncate">
                      {hl.label}
                      {hl.hint && <span className="text-[#6B7280] text-xs"> · {hl.hint}</span>}
                    </span>
                    {item.shortcut && (
                      <span
                        className="ml-auto rounded border border-[#374151] px-1.5 py-0.5 text-[#6B7280]"
                        style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
