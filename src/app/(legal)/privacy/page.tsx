import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Reliastra',
  description: 'Reliastra Privacy Policy. How we collect, use, and protect your data. Last updated August 2025.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Last updated: August 2025</p>
          <div className="mt-10 space-y-8 text-sm text-[#52525B] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly: account details (name, email, company), vendor configurations, alert preferences, and payment information (processed by our payment provider). We also automatically collect: usage logs, IP addresses, browser type, and device information when you access the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">2. Monitoring Data</h2>
              <p>Reliastra collects monitoring data (latency measurements, status checks, error rates) from third-party vendor endpoints on your behalf. This data is used to provide the Service, generate reports, and send alerts. Monitoring data is associated with your account and is not shared with the vendors being monitored.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">3. How We Use Your Information</h2>
              <p>We use your information to: provide and improve the Service, send notifications and alerts, process payments, respond to support requests, analyze usage patterns, and communicate about product updates. We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">4. Data Sharing</h2>
              <p>We share data only with: our payment processor (for billing), our infrastructure providers (to host the Service), and as required by law. We do not share monitoring data with the vendors being monitored. Aggregated, anonymized analytics may be used to improve the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">5. Data Retention</h2>
              <p>Monitoring data is retained according to your plan: Starter (7 days), Pro (90 days), Business (1 year). Account data is retained for the duration of your account plus 30 days. Upon account deletion, all personal data is permanently erased within 30 days, except where retention is required by law.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">6. GDPR Compliance</h2>
              <p>Reliastra complies with the EU General Data Protection Regulation (GDPR). Your rights under GDPR include: the right to access your personal data, the right to rectification, the right to erasure (&ldquo;right to be forgotten&rdquo;), the right to data portability, the right to object to processing, and the right to restrict processing. To exercise any of these rights, contact us at <a href="mailto:privacy@reliastra.com" className="text-[#0891B2] hover:underline">privacy@reliastra.com</a>. Our Data Protection Officer can be reached at the same address.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">7. Data Security</h2>
              <p>We implement industry-standard security measures including encryption at rest (AES-256) and in transit (TLS 1.3), access controls, regular security audits, and SOC 2 Type II compliance. While we strive to protect your data, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">8. Cookies and Tracking</h2>
              <p>We use essential cookies for authentication and session management. We use analytics cookies (anonymized) to understand Service usage. You can disable non-essential cookies in your browser settings. We do not use advertising cookies or sell data to ad networks.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">9. Third-Party Links</h2>
              <p>The Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party services you access through the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">10. Contact</h2>
              <p>For privacy-related inquiries or to exercise your GDPR rights, contact us at <a href="mailto:privacy@reliastra.com" className="text-[#0891B2] hover:underline">privacy@reliastra.com</a>.</p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
