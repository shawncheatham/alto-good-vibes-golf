import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Good Vibes Golf",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gvg-grass-dark to-gvg-grass">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <Link
            href="/"
            className="inline-block text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-white/70">Last updated: March 11, 2026</p>
        </header>

        <main className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We collect information you provide directly to us when you create an account,
              including your name, email address, phone number, and round data (scores, courses,
              players).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gvg-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              3. Information Sharing
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information:
            </p>
            <ul className="list-disc list-inside text-gvg-gray-700 space-y-2 ml-4">
              <li>With other users when you share round recaps or participate in group rounds</li>
              <li>With service providers who perform services on our behalf</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We take reasonable measures to protect your information from unauthorized access,
              loss, misuse, or disclosure. However, no internet transmission is completely secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              5. Data Retention
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to
              provide the Service. You may request deletion of your account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              6. Your Rights
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gvg-gray-700 space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              7. Cookies and Tracking
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your
              activity on the Service. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              8. Third-Party Services
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              The Service may contain links to third-party websites or services. We are not
              responsible for the privacy practices of these third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              The Service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              10. Changes to This Policy
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              11. Contact
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at
              privacy@goodvibesgolf.com.
            </p>
          </section>
        </main>

        <footer className="mt-12 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80 mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </nav>
          <p className="text-sm text-white/60">© 2026 Good Vibes Golf</p>
        </footer>
      </div>
    </div>
  );
}
