'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, IdCard, Users, Calendar, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Profile Page
 * 
 * This page displays user profile information and all event registrations.
 * 
 * Authentication:
 * - Uses JWT token stored in localStorage
 * - Token is verified using JWT_USER_SECRET from environment variables
 * - All API calls include Authorization header with Bearer token
 * - Redirects to /register if token is missing or invalid
 * 
 * Features:
 * - Displays user details (name, email, phone, college, etc.)
 * - Shows all registered events with details
 * - Displays team information for team events (Team ID, member count)
 * - Allows copying Team ID to clipboard
 * - Shows verification status for each registration
 */

interface UserData {
  email: string;
  userId: string;
  name: string;
  college: string;
  studentId: string;
  phoneNumber: string;
  referralCode?: string;
  branch: string;
  lastLoginAt: string;
  loginCount: number;
}

interface Registration {
  _id: string;
  eventId: string;
  userId: string;
  teamId: string;
  verified: boolean;
  feesPaid: string;
  dateTime: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamCounts, setTeamCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [copiedTeamId, setCopiedTeamId] = useState<string>('');
  const [hasFetched, setHasFetched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasFetched) {
      fetchUserProfile();
      setHasFetched(true);
    }
  }, [hasFetched]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/register');
        return;
      }

      // Fetch user details and registrations in parallel
      const [userResponse, regResponse] = await Promise.all([
        fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/registrations?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      const userData = await userResponse.json();
      
      if (!userData.user) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        router.push('/register');
        return;
      }
      
      setUser(userData.user);

      const regData = await regResponse.json();
      const userRegistrations = regData.registrations || [];
      setRegistrations(userRegistrations);

      // Lazy load team member counts only for team events
      // Instead of fetching all at once, fetch on demand
      const teamIds = [...new Set(userRegistrations.filter((r: Registration) => r.teamId).map((r: Registration) => r.teamId))] as string[];
      
      if (teamIds.length > 0) {
        // Load team counts asynchronously without blocking page render
        loadTeamCounts(token, userRegistrations, teamIds);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamCounts = async (token: string, userRegistrations: Registration[], teamIds: string[]) => {
    try {
      // Fetch team counts in smaller batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < teamIds.length; i += batchSize) {
        const batch = teamIds.slice(i, i + batchSize);
        const teamCountPromises = batch.map(async (teamId) => {
          const registration = userRegistrations.find((r: Registration) => r.teamId === teamId);
          if (registration) {
            const response = await fetch(`/api/registrations?eventId=${registration.eventId}&teamId=${teamId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const data = await response.json();
            return { teamId: teamId as string, count: data.total || 0 };
          }
          return { teamId: teamId as string, count: 0 };
        });
        
        const batchResults = await Promise.all(teamCountPromises);
        setTeamCounts(prev => {
          const updated = { ...prev };
          batchResults.forEach((result: { teamId: string; count: number }) => {
            updated[result.teamId] = result.count;
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error loading team counts:', error);
    }
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    setCopiedTeamId(teamId);
    setTimeout(() => setCopiedTeamId(''), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#140655] via-[#4321a9] to-[#2a0a56] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#fea6cc] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        
        body { font-family: 'Scheherazade New', serif; background-color: #010101; }
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
      `}</style>
      
      <main className="min-h-screen bg-gradient-to-b from-[#140655] via-[#4321a9] to-[#2a0a56] text-white">
        {/* Header */}
        <div className="relative pt-32 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] mb-4">
                MY PROFILE
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-[#2a0a56]/80 to-[#4321a9]/80 backdrop-blur-lg rounded-3xl p-6 border-2 border-[#b53da1]/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] rounded-full">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#ffd4b9]">User Details</h2>
                    <p className="text-sm text-[#fea6cc]/80">Your profile information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <User className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">Name</p>
                      <p className="text-white font-semibold">{user.name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <Mail className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">Email</p>
                      <p className="text-white font-semibold break-all">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <Phone className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">Phone</p>
                      <p className="text-white font-semibold">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <Building2 className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">College</p>
                      <p className="text-white font-semibold">{user.college || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <IdCard className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">Student ID</p>
                      <p className="text-white font-semibold">{user.studentId || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                    <IdCard className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#fea6cc]/60">Branch</p>
                      <p className="text-white font-semibold">{user.branch || 'Not provided'}</p>
                    </div>
                  </div>

                  {user.referralCode && (
                    <div className="flex items-start gap-3 p-3 bg-[#010101]/40 rounded-xl">
                      <IdCard className="w-5 h-5 text-[#fea6cc] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-[#fea6cc]/60">Referral Code</p>
                        <p className="text-white font-semibold">{user.referralCode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Registered Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-gradient-to-br from-[#2a0a56]/80 to-[#4321a9]/80 backdrop-blur-lg rounded-3xl p-6 border-2 border-[#b53da1]/30 shadow-2xl">
                <h2 className="text-2xl font-bold text-[#ffd4b9] mb-6">Registered Events ({registrations.length})</h2>

                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-[#fea6cc]/40 mx-auto mb-4" />
                    <p className="text-[#fea6cc] text-lg">No events registered yet</p>
                    <Link href="/events" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] rounded-xl text-white font-bold hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all">
                      Browse Events
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => {
                      const teamMemberCount = registration.teamId ? teamCounts[registration.teamId] || 0 : 0;
                      const hasTeam = !!registration.teamId;

                      return (
                        <motion.div
                          key={registration._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#010101]/40 border-2 border-[#b53da1]/30 rounded-xl p-5 hover:border-[#ed6ab8] transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">{registration.eventId}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {registration.verified ? (
                                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-sm rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm rounded-full flex items-center gap-1">
                                    <Loader2 className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-[#fea6cc]">
                                  <Calendar className="w-4 h-4" />
                                  <span>Registered: {formatDate(registration.dateTime)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Team Info */}
                            {hasTeam && (
                              <div className="bg-gradient-to-r from-[#b53da1]/20 to-[#ed6ab8]/20 border border-[#b53da1]/40 rounded-xl p-4 min-w-[250px]">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="w-5 h-5 text-[#fea6cc]" />
                                  <span className="text-[#ffd4b9] font-semibold">Team Details</span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-[#fea6cc]/60 mb-1">Team ID</p>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs text-white font-mono bg-[#010101]/40 px-2 py-1 rounded flex-1 break-all">
                                        {registration.teamId}
                                      </code>
                                      <button
                                        onClick={() => copyTeamId(registration.teamId)}
                                        className="p-1.5 bg-[#4321a9]/40 hover:bg-[#4321a9]/60 rounded transition-all"
                                      >
                                        {copiedTeamId === registration.teamId ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-[#fea6cc]" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-[#b53da1]/30">
                                    <span className="text-sm text-[#fea6cc]">Team Members</span>
                                    <span className="text-lg font-bold text-white">
                                      {teamMemberCount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
