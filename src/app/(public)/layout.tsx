import { Suspense } from 'react';
import { Auth0ProviderClient } from "@/components/auth0-provider";
import Navbar from '@/components/Navbar';
import ClickSpark from '@/components/ClickSpark';
import Cursor from "@/components/Cursor";
import PosterUploadHandler from '@/components/PosterUploadHandler';
import { Analytics } from "@vercel/analytics/next"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This is a nested layout (under (public)).
  // Do not render <html> or <body> here — the root layout already provides them.
  return (
    <>
      <Auth0ProviderClient>
        {/* <Cursor/> */}
        <ClickSpark
          sparkColor='#fea6cc'
          sparkSize={30}
          sparkRadius={15}
        sparkCount={4}
        duration={500}
        >
        <Suspense fallback={<div />}>
          <Navbar />
        </Suspense>
        <PosterUploadHandler />
        {children}
      </ClickSpark>
      <Analytics/>
      </Auth0ProviderClient>
    </>
  );
}
