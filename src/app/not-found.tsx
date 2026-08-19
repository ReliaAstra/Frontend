import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="font-mono-numeric text-7xl font-bold text-[rgba(148,163,184,0.08)] md:text-8xl">
            404
          </p>

          <div className="mt-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(148,163,184,0.08)] bg-[#0E131B]">
              <AlertTriangle className="h-5 w-5 text-[#5A6577]" />
            </div>
          </div>

          <h1 className="mt-6 text-lg font-semibold text-[#F3F5F7]">
            Dependency not found.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#8D98A8]">
            The resource you requested could not be located.
            This may indicate a misconfigured route or a dependency that no longer exists.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded border border-[rgba(148,163,184,0.08)] bg-[#0E131B] px-5 py-3">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
                Path
              </span>
              <span className="font-mono-numeric text-xs text-[#8D98A8]">
                [unknown]
              </span>
            </div>
            <div className="h-8 w-px bg-[rgba(148,163,184,0.08)]" aria-hidden="true" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
                Status
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                <span className="text-xs text-[#F59E0B]">Not Found</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </div>

          <p className="mt-16 text-xs text-[#5A6577]">
            RELIASTRA
          </p>
        </div>
      </main>
    </div>
  )
}
