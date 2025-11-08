import type { ReactNode } from 'react';
import AdminNavbar from '@/components/AdminNavbar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#140655' }}>
        <div className="flex-grow">
          {children}
        </div>
        
        {/* Footer - appears on all admin pages */}
        <div className="w-full py-6 px-4 text-center border-t border-slate-600/50 bg-slate-900/50 backdrop-blur-sm">
          <p className="text-slate-400/80 text-xs font-mono tracking-wide">
            💻 This admin panel is 100% AI-generated. If it breaks, blame the robots. 🤖
          </p>
        </div>
      </div>
    </>
  );
}
