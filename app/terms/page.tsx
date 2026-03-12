import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Good Vibes Golf",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-white/70">Last updated: March 11, 2026</p>
        </header>

        <main className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              By accessing and using Good Vibes Golf (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree to these terms, please do not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              2. Use of Service
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              You may use the Service to track golf rounds, view standings, and share recaps with
              other users. You agree to use the Service in compliance with all applicable laws and
              regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              4. User Content
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              You retain ownership of any content you submit to the Service, including round data,
              scores, and comments. By submitting content, you grant us a license to use, display,
              and distribute that content in connection with the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              5. Prohibited Conduct
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-gvg-gray-700 space-y-2 ml-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
              <li>Transmit any viruses, malware, or other harmful code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Scrape or collect data from the Service using automated means</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              6. Termination
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at any time,
              with or without cause, and with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              7. Disclaimer of Warranties
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind, either
              express or implied. We do not warrant that the Service will be uninterrupted, secure,
              or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising out of or related to
              your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Your continued use
              of the Service following any changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-gvg-gray-900 mb-4">
              10. Contact
            </h2>
            <p className="text-gvg-gray-700 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at
              hello@goodvibesgolf.com.
            </p>
          </section>
        </main>

        <footer className="mt-12 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80 mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </nav>
          <p className="text-sm text-white/60">© 2026 Good Vibes Golf</p>
        </footer>
      </div>
    </div>
  );
}
