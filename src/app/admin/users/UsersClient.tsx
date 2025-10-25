'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAdminUser, filterUsersByAccessLevel } from '@/lib/accessControl';

interface Registration {
  eventId: string;
  eventName: string;
  societyName: string;
  additionalClub?: string;
  verified: boolean;
  dateTime: string;
  teamId: string;
}

interface UserData {
  _id: string;
  userId: string;
  email: string;
  name?: string;
  college?: string;
  studentId?: string;
  phoneNumber?: string;
  branch?: string;
  registrations: Registration[];
  createdAt: string;
}

interface UsersClientProps {
  users: UserData[];
}

interface AdminUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

export default function UsersClient({ users }: UsersClientProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [localUsers, setLocalUsers] = useState<UserData[]>(users);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
  }, []);

  // Filter users by access level whenever adminUser changes
  useEffect(() => {
    const filtered = filterUsersByAccessLevel(users, adminUser);
    setLocalUsers(filtered);
  }, [adminUser, users]);

  // Filter and search users with event filtering
  const filteredUsers = useMemo(() => {
    return localUsers
      .filter((user) => {
        const isUserMatch =
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        const isEventMatch = user.registrations.some(reg =>
          reg.eventName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesSearch = isUserMatch || isEventMatch;
        const hasRegistrations = user.registrations.length > 0;

        if (filterBy === 'registered') return matchesSearch && hasRegistrations;
        if (filterBy === 'unregistered') return matchesSearch && !hasRegistrations;
        return matchesSearch;
      })
      .map((user) => ({
        ...user,
        // Filter registrations to only show matching events if search is for event
        registrations:
          searchTerm.toLowerCase() === ''
            ? user.registrations
            : user.registrations.filter((reg) =>
                reg.eventName.toLowerCase().includes(searchTerm.toLowerCase())
              ),
      }));
  }, [localUsers, searchTerm, filterBy]);

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, teamId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTeamId(teamId);
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Floating Search and Filter Bar */}
      <div className="sticky top-0 z-50 flex flex-col gap-3 md:gap-4 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 px-3 md:px-4 py-3 md:py-4 rounded-b-lg md:rounded-b-2xl shadow-lg">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 md:left-4 top-3 md:top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-600/50 focus:border-purple-500/80 focus:bg-slate-800/80 focus:outline-none text-slate-100 placeholder-slate-400 text-sm md:text-base transition-all duration-300 shadow-md"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'registered', 'unregistered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter)}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 border-2 text-xs md:text-sm whitespace-nowrap ${
                filterBy === filter
                  ? 'bg-purple-600/80 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/40 border-slate-600/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <Filter size={14} className="inline mr-1.5 md:mr-2" />
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2 md:space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <AlertCircle size={40} className="mx-auto text-slate-400 mb-2 md:mb-3 opacity-50" />
            <p className="text-slate-400 text-base md:text-lg font-semibold">No users found</p>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-gradient-to-r from-slate-900/50 to-slate-800/30 rounded-xl md:rounded-2xl border-2 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 overflow-hidden"
            >
              {/* User Header */}
              <button
                onClick={() => toggleUserExpand(user.userId)}
                className="w-full text-left p-3 md:p-4 hover:bg-slate-800/20 transition-all duration-200 flex items-center justify-between gap-2 md:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span className="text-xl md:text-2xl flex-shrink-0 filter brightness-0 invert">👤</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-100 text-sm md:text-lg truncate">{user.name || 'Unknown'}</p>
                      <p className="text-slate-400 text-xs md:text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-slate-900/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-600/30">
                    <span className="text-xs md:text-sm font-semibold text-slate-300">📜 {user.registrations.length}</span>
                  </div>
                  {expandedUsers.has(user.userId) ? (
                    <ChevronUp className="text-slate-400" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </div>
              </button>

              {/* User Details - Expanded */}
              {expandedUsers.has(user.userId) && (
                <div className="border-t border-slate-600/30 bg-slate-900/30 p-3 md:p-4 space-y-4">
                  {/* User Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {[
                      { label: 'User ID', value: user.userId },
                      { label: 'Email', value: user.email },
                      { label: 'Student ID', value: user.studentId || 'N/A' },
                      { label: 'Phone', value: user.phoneNumber || 'N/A' },
                      { label: 'College', value: user.college || 'N/A' },
                      { label: 'Branch', value: user.branch || 'N/A' },
                    ].map((info) => (
                      <div key={info.label} className="bg-slate-900/50 rounded-lg p-2 md:p-3 border border-slate-600/20">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{info.label}</p>
                        <p className="text-slate-200 font-medium truncate text-sm md:text-base">{info.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Registrations */}
                  {(() => {
                    // Filter registrations based on admin access level
                    const displayedRegistrations = adminUser?.accesslevel === 1
                      ? user.registrations.filter(reg => reg.societyName === adminUser.clubsoc || reg.additionalClub === adminUser.clubsoc)
                      : user.registrations;

                    return displayedRegistrations.length > 0 ? (
                      <div className="mt-4 md:mt-6 pt-4 border-t border-slate-600/30">
                        <h3 className="font-bold text-slate-100 mb-2 md:mb-3 flex items-center gap-2">
                          <span className="text-lg md:text-xl filter brightness-0 invert">🎭</span>
                          <span className="text-sm md:text-base">Event Registrations</span>
                        </h3>
                        <div className="space-y-2 md:space-y-3">
                          {displayedRegistrations.map((reg, idx) => (
                          <div
                            key={`${reg.eventId}-${idx}`}
                            className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-3 md:p-4 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                          >
                              <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-100 text-sm md:text-lg truncate">{reg.eventName}</p>
                                  <p className="text-slate-400 text-xs md:text-sm mb-1">{reg.societyName}</p>
                                  {reg.additionalClub && reg.additionalClub !== 'None' && (
                                    <p className="text-purple-300 text-xs md:text-sm mb-1">+ {reg.additionalClub}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span>📅 {formatDate(reg.dateTime)}</span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {reg.verified ? (
                                    <div className="flex items-center gap-1 bg-emerald-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-emerald-500/50">
                                      <CheckCircle2 size={14} className="text-emerald-400" />
                                      <span className="text-xs font-semibold text-emerald-300">Verified</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 bg-amber-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-amber-500/50">
                                      <AlertCircle size={14} className="text-amber-400" />
                                      <span className="text-xs font-semibold text-amber-300">Pending</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Team ID Section */}
                              {reg.teamId && (
                                <div className="border-t border-slate-600/30 pt-3">
                                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Team ID</p>
                                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 border border-slate-600/30 group hover:border-slate-500/50 transition-all">
                                    <code className="flex-1 text-xs md:text-sm font-mono text-slate-300 truncate">{reg.teamId}</code>
                                    <button
                                      onClick={() => copyToClipboard(reg.teamId, reg.teamId)}
                                      className="flex-shrink-0 p-1.5 md:p-2 hover:bg-slate-700/50 rounded transition-all"
                                      title="Copy Team ID"
                                    >
                                      {copiedTeamId === reg.teamId ? (
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                      ) : (
                                        <Copy size={16} className="text-slate-400 group-hover:text-slate-200" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 md:mt-6 pt-4 border-t border-slate-600/30 text-center py-6 md:py-8">
                        <span className="text-3xl md:text-4xl filter brightness-0 invert mb-2 md:mb-3 block">📭</span>
                        <p className="text-slate-400 font-semibold text-sm md:text-base">No registrations yet</p>
                      </div>
                    );
                  })()}

                  {/* User Metadata */}
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-600/30 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm text-slate-400">
                    <div>
                      <span className="font-semibold">Joined:</span>
                      <p className="text-slate-300 mt-1 text-xs md:text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg md:rounded-xl border border-purple-500/30 text-center">
        <p className="text-slate-300 font-semibold text-sm md:text-base">
          Showing <span className="text-purple-400">{filteredUsers.length}</span> of{' '}
          <span className="text-purple-400">{localUsers.length}</span> users
        </p>
      </div>
    </div>
  );
}
