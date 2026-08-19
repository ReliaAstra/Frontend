import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detection Guarantee | Reliastra',
  description: 'Understanding Reliastra\'s approach to detection guarantees and SLA evidence generation.',
};

export default function GuaranteePage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight">Detection Guarantee</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Last updated: August 2025</p>
          <div className="mt-10 space-y-8 text-sm text-[#52525B] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">Our Evolution</h2>
              <p>
                When we first launched Reliastra, we offered a &ldquo;Detection Guarantee&rdquo; :  a promise that we
                would detect vendor outages faster than the vendor&apos;s own status page. While this resonated with
                engineers, we realized our real value went far beyond detection speed.
              </p>
              <p className="mt-3">
                We&apos;ve since evolved our focus from detection guarantees to <strong className="text-[#09090B]">SLA evidence generation</strong>. The
                reason is simple: detecting an outage is only the first step. What engineering teams actually need is
                the evidence to hold vendors accountable, recover credits, and prevent future incidents.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">What We Guarantee</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-[#09090B]">Independent Data Collection:</strong> All monitoring data is collected from our own infrastructure, independent of any vendor&apos;s systems. This ensures no conflict of interest.</li>
                <li><strong className="text-[#09090B]">Timestamped Evidence:</strong> Every data point includes a precise UTC timestamp, making it suitable for SLA disputes and formal vendor communications.</li>
                <li><strong className="text-[#09090B]">Consistent Monitoring Intervals:</strong> We maintain the check intervals specified in your plan (standard interval on Free, Starter, and Standard; faster 15-second intervals on Professional and Agency) with 99.9% reliability on our own infrastructure.</li>
                <li><strong className="text-[#09090B]">Multi-Region Probes:</strong> Monitoring is conducted from multiple geographic regions, providing a more complete picture than single-region checks.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">What&apos;s Not Covered</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Reliastra cannot guarantee detection of <strong className="text-[#09090B]">all</strong> outages. Some vendor issues may manifest as partial degradation that falls within normal variance.</li>
                <li>We do not guarantee that SLA evidence reports will result in successful credit claims. Vendor response to claims is outside our control.</li>
                <li>Our monitoring covers only the API endpoints and services you configure. It does not cover vendor-internal infrastructure.</li>
                <li>Force majeure events (natural disasters, government actions, etc.) affecting our own infrastructure are exempt from our monitoring guarantee.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">SLA Evidence Reports</h2>
              <p>
                Our SLA evidence reports are generated from independently collected data and include: incident
                timeline, latency metrics, error rates, geographic impact analysis, and a methodology description.
                These reports are structured for use in vendor communications and dispute resolution.
              </p>
              <p className="mt-3">
                Full evidence generation is available on Standard, Professional, and Agency plans. Professional and
                Agency subscribers also receive custom-branded reports; Agency subscribers receive client-facing
                branded evidence.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#09090B] mb-3">Questions?</h2>
              <p>
                If you have questions about our guarantee or evidence generation capabilities, please
                contact us at <a href="mailto:support@reliastra.com" className="text-[#0891B2] hover:underline">support@reliastra.com</a>.
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
