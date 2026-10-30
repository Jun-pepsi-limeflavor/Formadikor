import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CopyEmailButton } from "@/components/analytics/GoogleAnalytics";
import { SUPPORT_PHONE_US, SUPPORT_PHONE_US_TEL } from "@/lib/constants/support";

export function Footer() {
  return (
    <footer className="bg-[#0A1628] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <BrandLogo tone="light" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Korean Precision Manufacturing, On Demand. Access South Korea&apos;s advanced manufacturing network.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["ISO 9001", "IATF 16949", "AS9100D", "KORUS FTA"].map((cert) => (
                <span
                  key={cert}
                  className="rounded-sm border border-gray-700 px-2 py-0.5 text-xs text-gray-400"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Capabilities</h4>
            <ul className="space-y-2">
              {[
                ["CNC Machining", "/capabilities/cnc-machining"],
                ["Injection Molding", "/capabilities/injection-molding"],
                ["Sheet Metal", "/capabilities/sheet-metal"],
                ["Die Casting", "/capabilities/die-casting"],
                ["Construction Components", "/capabilities/construction-components"],
                ["Electronics / PCB", "/capabilities/electronics-pcb"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h4>
            <ul className="space-y-2">
              {[
                ["How It Works", "/how-it-works"],
                ["Industries", "/industries"],
                ["Contact Us", "/contact"],
                ["Get a Quote", "/signup"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <CopyEmailButton location="footer" className="hover:text-white transition-colors" />
              </li>
              <li>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-0.5">US</p>
                <a
                  href={`tel:${SUPPORT_PHONE_US_TEL}`}
                  className="text-base font-medium text-gray-400 hover:text-[#0066FF] transition-colors"
                >
                  {SUPPORT_PHONE_US}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} forma di kor. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-white">Terms of Service</Link>
            <span className="text-xs text-gray-500">NDA Available on Request</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
