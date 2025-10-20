import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/adminUser';
import ClearanceClient from './ClearanceClient';

interface IAdmin {
  _id: string;
  email: string;
  userId: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
  name: string;
  dateTime: string;
  createdAt: string;
}

async function getAdmins(): Promise<IAdmin[]> {
  try {
    await dbConnect();

    const admins = await Admin.find({})
      .sort({ accesslevel: -1, createdAt: -1 })
      .lean();

    return admins.map((admin: any) => ({
      _id: admin._id.toString(),
      email: admin.email,
      userId: admin.userId,
      accesslevel: admin.accesslevel,
      clubsoc: admin.clubsoc,
      verified: admin.verified,
      name: admin.name,
      dateTime: admin.dateTime.toISOString(),
      createdAt: admin.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl filter brightness-0 invert">🔐</span>
        </div>
      </div>
      <p className="mt-4 text-slate-300 font-semibold animate-pulse">Accessing the sacred vault...</p>
    </div>
  );
}

export default async function ClearancePage() {
  // Check if user has admin access
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const admins = await getAdmins();

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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 flex-wrap">
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">🔐</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Clearance Council
            </h1>
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">👑</span>
          </div>
          <p className="mt-3 text-lg text-slate-300 font-medium italic">
            ✨ Guardians of the Sacred Gates ✨
          </p>

          {/* Stats Cards */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">👥</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Guardians
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {admins.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 to-green-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">✓</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Verified
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {admins.filter((a) => a.verified).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-yellow-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">👑</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Webmasters
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {admins.filter((a) => a.accesslevel === 3).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          {/* Ornamental top border */}
          <div className="h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>

          <div className="p-2 sm:p-6">
            <Suspense fallback={<LoadingState />}>
              <ClearanceClient admins={admins} />
            </Suspense>
          </div>

          {/* Ornamental bottom border */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
        </div>

        {/* Footer decoration */}
        <div className="mt-8 text-center">
          <p className="text-slate-400/70 text-sm italic">
            ✧ May wisdom guide your choices ✧
          </p>
        </div>
      </div>
    </div>
  );
}