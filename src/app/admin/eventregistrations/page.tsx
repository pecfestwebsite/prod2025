import { Suspense } from 'react';
import EventRegistrationsClient from './eventregclient';

export const dynamic = 'force-dynamic';

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl filter brightness-0 invert">🌙</span>
        </div>
      </div>
      <p className="mt-4 text-slate-300 font-semibold animate-pulse">Unveiling the mystical scrolls...</p>
    </div>
  );
}

export default async function EventRegistrationsPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-white text-xl animate-pulse filter brightness-0 invert">✦</div>
        <div className="absolute top-40 right-20 text-white text-2xl animate-pulse delay-100 filter brightness-0 invert">✧</div>
        <div className="absolute bottom-32 left-32 text-white text-lg animate-pulse delay-200 filter brightness-0 invert">✦</div>
        <div className="absolute top-60 right-40 text-white text-xl animate-pulse delay-300 filter brightness-0 invert">✧</div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <Suspense fallback={<LoadingState />}>
          <EventRegistrationsClient />
        </Suspense>
      </div>
    </div>
  );
}
