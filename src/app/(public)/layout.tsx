
import { Auth0ProviderClient } from "@/components/auth0-provider";
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This is a nested layout (under (public)).
  // Do not render <html> or <body> here — the root layout already provides them.
  return (
    <>
      <Auth0ProviderClient>
        <Navbar />  
        {children}
      </Auth0ProviderClient>
    </>
  );
}
