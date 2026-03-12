import Link from "next/link";

export default function Hero() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gvg-grass-dark to-gvg-grass px-6 py-12">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-6 text-balance">
          Good Vibes Golf
        </h1>

        <p className="text-xl md:text-2xl mb-8 font-medium text-balance">
          It&apos;s not about the score.
          <br />
          It&apos;s about who you&apos;re playing with.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            href="/signup"
            className="min-h-touch min-w-touch px-8 py-3 bg-gvg-accent hover:bg-gvg-accent-hover text-white font-display font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="min-h-touch min-w-touch px-8 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-display font-semibold rounded-lg border border-white/30 transition-all duration-200 flex items-center justify-center"
          >
            Login
          </Link>
        </div>
        <div className="mb-10">
          <Link
            href="/membership"
            className="text-white/70 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors duration-200"
          >
            View Membership Plans
          </Link>
        </div>

        <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto text-balance">
          A social format for playing golf. Track your round, see live standings, and share
          the moments that make golf worth it — regardless of how you play.
        </p>
      </div>
    </main>
  );
}
