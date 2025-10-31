import "./globals.css";
import MagicLamp from "@/components/MagicLamp";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="dark:bg-gray-900">
        {children}
        <MagicLamp />
        <SpeedInsights />
      </body>
    </html>
  );
}
