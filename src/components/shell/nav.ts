import {
  LayoutDashboard,
  Link,
  AlertTriangle,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** The five primary navigation destinations (sidebar + command palette). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dependencies", href: "/dependencies", icon: Link },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Evidence", href: "/evidence", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/settings") return pathname === "/settings" || pathname.startsWith("/settings/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Pretty incident reference, e.g. `demo-inc-0001` → `INC-0001`. */
export function incidentRef(id: string): string {
  const clean = id.replace(/^(demo[-_])?inc[-_]?/i, "").toUpperCase();
  const token = clean.split(/[-_]/).filter(Boolean).pop() || clean;
  return `INC-${token}`;
}

/** Pretty report reference, e.g. `demo-evid-0001` → `RPT-0001`. */
export function reportRef(id: string): string {
  const clean = id.replace(/^(demo[-_])?evid(ence)?[-_]?/i, "").toUpperCase();
  const token = clean.split(/[-_]/).filter(Boolean).pop() || clean;
  return `RPT-${token}`;
}

export function shortId(id: string, length = 8): string {
  return id.slice(0, length);
}
