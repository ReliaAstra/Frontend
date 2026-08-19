export function Footer() {
  return (
    <footer className="mt-auto bg-[#0A0C12] border-t border-[rgba(148,163,184,0.06)]">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="tracking-wide text-sm text-[#F3F5F7]">
              RELIASTRA
            </p>
            <p className="mt-2 text-xs text-[#5A6577] max-w-[200px]">
              Accountability infrastructure for digital systems.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs uppercase tracking-wide text-[#5A6577] mb-3">
              Product
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Vendor Intelligence
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs uppercase tracking-wide text-[#5A6577] mb-3">
              Company
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs uppercase tracking-wide text-[#5A6577] mb-3">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8D98A8] hover:text-[#F3F5F7] transition-colors duration-150">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(148,163,184,0.06)]">
          <p className="text-xs text-[#5A6577]">
            © 2025 Reliastra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}