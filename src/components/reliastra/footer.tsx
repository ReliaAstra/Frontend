export function Footer() {
  return (
    <footer id="resources" className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm tracking-wide text-slate-900">RELIASTRA</p>
            <p className="mt-2 max-w-[200px] text-xs text-slate-500">
              Accountability infrastructure for digital systems.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Product</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="#product"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#vendor-intelligence"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Vendor Intelligence
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Company</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="#top"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#resources"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#resources"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Legal</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="#resources"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#resources"
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">© 2026 Reliastra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
