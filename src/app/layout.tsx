import "./globals.css";
import MagicLamp from "@/components/MagicLamp";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <MagicLamp />
      </body>
    </html>
  );
}
