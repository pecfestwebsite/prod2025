import type { ReactNode } from 'react';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen" style={{ backgroundColor: '#140655' }}>
        {children}
      </div>
    </>
  );
}
