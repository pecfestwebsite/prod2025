import "./globals.css";
import MagicLamp from "@/components/MagicLamp";
// import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PECFEST 2025",
  description: "PEC University of Technology's Annual Techno-Cultural Festival",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="dark:bg-gray-900">
        {children}
        <MagicLamp />
        {/* <SpeedInsights /> */}
      </body>
    </html>
  );
}
