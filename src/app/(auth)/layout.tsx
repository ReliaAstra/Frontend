import { AuthProvider } from "@/lib/auth-context";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthSplitLayout>{children}</AuthSplitLayout>
    </AuthProvider>
  );
}
