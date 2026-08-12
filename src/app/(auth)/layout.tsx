import { AuthProvider } from "@/lib/auth-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4">
        {children}
      </div>
    </AuthProvider>
  );
}