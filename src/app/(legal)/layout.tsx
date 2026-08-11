import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Minimal nav for legal pages */}
      <header className="h-[72px] flex items-center bg-white border-b border-[#E4E4E7]">
        <nav className="max-w-[1200px] mx-auto px-6 md:px-12 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0" aria-label="Reliastra home">
            <span className="text-2xl font-bold tracking-[-0.02em] text-[#09090B]">
              reliastra<span className="text-[#0891B2] translate-y-[-2px] inline-block">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
          >
            &larr; Back to Home
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
