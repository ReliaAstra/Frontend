import { PartnerNavbar } from '@/components/partner/PartnerNavbar';
import { PartnerFooter } from '@/components/partner/PartnerFooter';
import { AuthProvider } from '@/lib/auth-context';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PartnerNavbar />
      <main>{children}</main>
      <PartnerFooter />
    </AuthProvider>
  );
}
