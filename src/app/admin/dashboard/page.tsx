'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  verifiedRegistrations: number;
  pendingVerifications: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    verifiedRegistrations: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch dashboard statistics
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [eventsRes, registrationsRes] = await Promise.all([
        fetch('/api/events?limit=1000'),
        fetch('/api/registrations?limit=1000'),
      ]);

      let totalEvents = 0;
      let totalRegistrations = 0;
      let verifiedRegistrations = 0;

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        totalEvents = eventsData.events?.length || 0;
      }

      if (registrationsRes.ok) {
        const registrationsData = await registrationsRes.json();
        totalRegistrations = registrationsData.registrations?.length || 0;
        verifiedRegistrations = registrationsData.registrations?.filter(
          (r: any) => r.verified
        ).length || 0;
      }

      setStats({
        totalEvents,
        totalRegistrations,
        verifiedRegistrations,
        pendingVerifications: totalRegistrations - verifiedRegistrations,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
  }: {
    icon: React.ComponentType<{ size: number }>;
    title: string;
    value: number;
    color: string;
  }) => (
    <div className="rounded-2xl p-6 border-2 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40" style={{
      backgroundColor: '#0f0444',
      borderColor: '#4321a9',
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
        <TrendingUp size={20} className="text-purple-300" />
      </div>
      <p className="text-slate-300 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl sm:text-4xl font-bold text-white">
        {value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Starlight background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-magenta-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-orange-600 rounded-full blur-3xl opacity-80"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl sm:text-4xl filter brightness-0 invert">🌙</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Dashboard
            </h1>
          </div>
          <p className="text-slate-300 text-sm sm:text-base">
            ✧ Welcome to your PECFest Admin Portal ✧
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border-2 animate-pulse"
                style={{
                  backgroundColor: '#0f0444',
                  borderColor: '#4321a9',
                }}
              >
                <div className="h-10 w-10 bg-purple-800/50 rounded-lg mb-4"></div>
                <div className="h-4 w-24 bg-purple-800/50 rounded mb-2"></div>
                <div className="h-8 w-32 bg-purple-800/50 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Calendar}
              title="Total Events"
              value={stats.totalEvents}
              color="bg-blue-600/20 text-blue-300"
            />
            <StatCard
              icon={Users}
              title="Total Registrations"
              value={stats.totalRegistrations}
              color="bg-purple-600/20 text-purple-300"
            />
            <StatCard
              icon={CheckCircle}
              title="Verified"
              value={stats.verifiedRegistrations}
              color="bg-emerald-600/20 text-emerald-300"
            />
            <StatCard
              icon={Calendar}
              title="Pending"
              value={stats.pendingVerifications}
              color="bg-orange-600/20 text-orange-300"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
            <span className="text-2xl filter brightness-0 invert">⚡</span> Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: '📅',
                title: 'Add New Event',
                description: 'Create and configure a new event',
                href: '/admin/addevents',
                color: 'from-blue-600/20 to-blue-500/10',
              },
              {
                icon: '📆',
                title: 'View Calendar',
                description: 'See all events in calendar view',
                href: '/admin/calendar',
                color: 'from-indigo-600/20 to-indigo-500/10',
              },
              {
                icon: '👥',
                title: 'View Registrations',
                description: 'Manage and verify registrations',
                href: '/admin/registrations',
                color: 'from-purple-600/20 to-purple-500/10',
              },
              {
                icon: '✓',
                title: 'Clearance',
                description: 'Handle event clearances',
                href: '/admin/clearance',
                color: 'from-emerald-600/20 to-emerald-500/10',
              },
            ].map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="rounded-2xl p-6 border-2 border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 group cursor-pointer"
                style={{
                  backgroundColor: '#0f0444',
                }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-slate-300 text-sm">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
            <span className="text-2xl filter brightness-0 invert">📊</span> Welcome Back
          </h2>

          <div className="rounded-2xl p-6 sm:p-8 border-2" style={{
            backgroundColor: '#0f0444',
            borderColor: '#4321a9',
          }}>
            <div className="flex items-center gap-4">
              <div className="text-5xl filter brightness-0 invert">✨</div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Your Mystical Realm Awaits
                </h3>
                <p className="text-slate-300 text-sm sm:text-base">
                  Navigate through the dashboard to manage events, registrations, and keep
                  track of all PECFest activities. Use the navbar to access different
                  sections of the admin portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
