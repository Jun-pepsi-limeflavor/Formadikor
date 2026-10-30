import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ChannelTalk } from "@/components/analytics/ChannelTalk";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "forma di kor — Korean Precision Manufacturing, On Demand",
  description:
    "Access South Korea's advanced manufacturing network. World-class tolerances, KORUS FTA pricing, and a dedicated account team. CNC Machining, Injection Molding, Sheet Metal, Die Casting, PCB Assembly.",
  keywords: [
    "Korean manufacturing platform",
    "Korea CNC machining",
    "Korean precision manufacturing",
    "KORUS FTA",
    "Korean contract manufacturing",
  ].join(", "),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${cormorantGaramond.variable}`}
    >
      <body className="min-h-full font-sans">
        <AuthProvider>{children}</AuthProvider>
        <GoogleAnalytics />
        <ChannelTalk />
      </body>
    </html>
  );
}
