import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md py-4">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80 mb-2">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </nav>
        <p className="text-center text-sm text-white/60">© 2026 Good Vibes Golf</p>
      </div>
    </footer>
  );
}
