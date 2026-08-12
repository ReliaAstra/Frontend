import { AuthProvider } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0F1117]">
        <DashboardSidebar />
        <div className="ml-[260px]">
          <DashboardHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}