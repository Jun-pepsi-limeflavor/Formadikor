import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlideshow } from "@/components/public/HeroSlideshow";
import { SUPPORT_EMAIL } from "@/lib/constants/support";

const STATS = [
  { value: "120+", label: "Korean Manufacturing Partners" },
  { value: "±0.005mm", label: "Precision Capability" },
  { value: "3 Days", label: "Minimum Turnaround" },
  { value: "98.2%", label: "On-Time Delivery Rate" },
];

const SERVICES = [
  {
    name: "CNC Machining",
    slug: "cnc-machining",
    description: "5-axis milling, turning, EDM, gear hobbing",
    highlight: "±0.005mm tolerances",
    spec: "50+ materials",
  },
  {
    name: "Injection Molding",
    slug: "injection-molding",
    description: "Prototype & production tooling, overmolding",
    highlight: "3-week tool turnaround",
    spec: "30+ resins",
  },
  {
    name: "Sheet Metal Fabrication",
    slug: "sheet-metal",
    description: "Laser cutting, press brake, stamping, welding",
    highlight: "±0.1mm tolerance",
    spec: "12 surface treatments",
  },
  {
    name: "Die Casting",
    slug: "die-casting",
    description: "HPDC aluminum & zinc, investment casting",
    highlight: "IATF 16949 certified",
    spec: "0.05–50 kg range",
  },
  {
    name: "Modular Construction",
    slug: "construction-components",
    description: "Steel frames, facade panels, MEP pods",
    highlight: "Factory-built precision",
    spec: "±2mm structural tolerance",
  },
  {
    name: "Electronics / PCB Assembly",
    slug: "electronics-pcb",
    description: "PCB fab, SMT assembly, box build, testing",
    highlight: "IPC Class 2/3",
    spec: "3-day quick-turn",
  },
];

const VALUE_PROPS = [
  {
    title: "KORUS FTA: Tariff-Free Access",
    body: "Under the Korea-US Free Trade Agreement, the majority of manufactured goods enter the US at 0% import duty. Unlike China-sourced components facing 25%+ tariffs, Korean parts remain cost-competitive regardless of trade policy shifts.",
  },
  {
    title: "Precision That Matches Any Market",
    body: "Korea is home to Doosan, Hwacheon, and Hyundai WIA — manufacturers whose machines hold tolerances to ±0.0005\". The same precision infrastructure supports our partner network. ±0.005mm is our standard; tighter tolerances are available from select partner facilities.",
  },
  {
    title: "World's Most Automated Manufacturing Economy",
    body: "South Korea operates 1,000+ industrial robots per 10,000 workers — the highest density globally. That automation translates directly to consistency, repeatability, and scalability for your production programs.",
  },
  {
    title: "Cost Efficiency Without Compromise",
    body: "At current KRW/USD exchange rates (~1,550 KRW per dollar), Korean manufacturing delivers 25–40% cost savings versus US domestic production — without the quality sacrifice or geopolitical risk associated with China sourcing.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Upload & Configure",
    body: "Upload your CAD file or drawing. Select manufacturing process, material, finish, quantity, and target delivery date. Our system generates a preliminary assessment within minutes.",
  },
  {
    num: "02",
    title: "Quote & Review",
    body: "Your dedicated account manager reviews DFM (Design for Manufacturability), confirms specifications, and delivers a fixed price quote with guaranteed lead time — typically within 24 hours.",
  },
  {
    num: "03",
    title: "Manufacture & Deliver",
    body: "Parts are produced at our vetted Korean partner facilities, inspected to spec, and shipped directly to your facility. Track every step in your dashboard.",
  },
];

const TESTIMONIALS = [
  {
    quote: "We reduced part cost by 31% versus our prior US supplier while improving tolerance capability. formadikor made the Korean supply chain accessible without us needing a sourcing team.",
    name: "David Chen",
    title: "VP of Operations",
    company: "Torque Robotics",
    service: "CNC Machining",
    metric: "31% cost reduction",
  },
  {
    quote: "Lead time from RFQ to first articles was 11 days for a 5-axis aluminum housing. That would have been 3–4 weeks domestic. The DFM feedback caught two issues before we cut steel.",
    name: "Sarah Mitchell",
    title: "Mechanical Engineering Lead",
    company: "Aria Systems",
    service: "CNC Machining + Injection Molding",
    metric: "11-day first article",
  },
  {
    quote: "For our hardware startup, formadikor gives us production-grade Korean suppliers without the overhead of managing overseas relationships. The account manager model is genuinely different.",
    name: "James Park",
    title: "Co-Founder & CTO",
    company: "Lumen Hardware",
    service: "Sheet Metal + PCB Assembly",
    metric: "40% BOM cost reduction",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[520px] overflow-hidden bg-[#0A1628] text-white lg:min-h-[600px]">
        <HeroSlideshow />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-gray-300 px-3 py-1 text-xs font-medium text-gray-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              KORUS FTA · 0% Import Duty · US-Ally Supply Chain
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              Korean Precision <br/>
              <span className="whitespace-nowrap">Manufacturing, On Demand.</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-100">
              Access South Korea&apos;s advanced manufacturing network — world-class tolerances, KORUS FTA pricing, and a dedicated account team. From prototype to production.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#0066FF] px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white-300 px-8 py-3.5 text-base font-medium text-white-300 hover:bg-white/5 transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-300">
                STEP · STP · IGES · DXF · DWG · PDF — All uploads are encrypted and confidential.
              </p>
              <div className="flex flex-wrap gap-3">
                {["ISO 9001:2015", "IATF 16949", "AS9100D", "KORUS FTA", "ITAR-Compliant"].map((cert) => (
                  <span key={cert} className="rounded-sm border border-gray-500 px-2 py-0.5 text-xs text-gray-300">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-[#E5E7EB] lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.value} className="flex flex-col items-center py-8 px-4 text-center">
                <span className="spec-value text-3xl font-bold text-[#0066FF]">{stat.value}</span>
                <span className="mt-1 text-sm text-[#6B7280]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-3xl font-bold text-[#1A1A2E]">
            Our Manufacturing Capabilities
          </h2>
          <p className="mb-12 text-center text-[#6B7280]">
            Six manufacturing disciplines. One platform. One account manager.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((svc) => (
              <div
                key={svc.slug}
                className="group rounded-sm border border-[#E5E7EB] bg-white p-6 shadow-sm hover:border-[#0066FF]/30 hover:shadow-md transition-all"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#1A1A2E]">{svc.name}</h3>
                <p className="mb-4 text-sm text-[#6B7280] leading-relaxed">{svc.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-sm bg-blue-50 px-3 py-0.5 text-xs font-medium text-[#0066FF]">
                    {svc.highlight}
                  </span>
                  <span className="rounded-sm bg-gray-100 px-3 py-0.5 text-xs font-medium text-[#6B7280]">
                    {svc.spec}
                  </span>
                </div>
                <Link
                  href={`/capabilities/${svc.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0066FF] group-hover:gap-2 transition-all"
                >
                  Learn More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-3xl font-bold text-[#1A1A2E]">
            From File Upload to Finished Parts — Three Steps.
          </h2>
          <p className="mb-12 text-center text-[#6B7280]">No sourcing agents. No hidden markups. Transparent offshore process.</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-[#0A1628]">
                  <span className="spec-value text-sm font-bold text-white">{step.num}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#1A1A2E]">{step.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY KOREA ────────────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-3xl font-bold">Why Source From Korea?</h2>
          <p className="mb-12 text-center text-gray-400">
            Four structural advantages that make Korea a compelling manufacturing source.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="border-l-2 border-[#0066FF] pl-5">
                <h3 className="mb-2 font-semibold text-white">{vp.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{vp.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#1A1A2E]">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-sm border border-[#E5E7EB] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex items-center rounded-sm bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {t.metric}
                </div>
                <p className="mb-4 text-sm text-[#1A1A2E] leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-[#E5E7EB] pt-4">
                  <p className="font-medium text-[#1A1A2E]">{t.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {t.title}, {t.company}
                  </p>
                  <p className="mt-1 text-xs text-[#0066FF]">{t.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="bg-[#0066FF] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold">Ready to Source from Korea?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Get a quote in 24 hours. No commitment. No sourcing agents.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-sm bg-white px-8 py-3.5 text-base font-semibold text-[#0066FF] hover:bg-blue-50 transition-colors"
          >
            Get a Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-blue-200">
            Or speak with an account manager:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
