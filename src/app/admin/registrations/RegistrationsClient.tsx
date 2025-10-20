'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Eye, Check, X, Loader } from 'lucide-react';
import { getAdminUser, canVerifyRegistrations, filterRegistrationsByAccessLevel } from '@/lib/accessControl';

interface RegistrationWithEvent {
  _id: string;
  eventId: string;
  eventName: string;
  userId: string;
  teamUserIds: string[];
  verified: boolean;
  feesPaid: string;
  dateTime: string;
  createdAt: string;
  societyName?: string;
}

interface RegistrationsClientProps {
  registrations: RegistrationWithEvent[];
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

type SortField = 'eventName' | 'userId' | 'dateTime' | 'verified' | 'teamSize';
type SortOrder = 'asc' | 'desc';

export default function RegistrationsClient({ registrations }: RegistrationsClientProps) {
  const [sortField, setSortField] = useState<SortField>('dateTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [localRegistrations, setLocalRegistrations] = useState<RegistrationWithEvent[]>(registrations);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
  }, []);

  // Filter registrations by access level whenever adminUser changes
  useEffect(() => {
    const filtered = filterRegistrationsByAccessLevel(registrations, adminUser);
    setLocalRegistrations(filtered);
  }, [adminUser, registrations]);

  // Filter and sort registrations
  const filteredAndSortedRegistrations = useMemo(() => {
    let filtered = [...localRegistrations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.eventId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply verified filter
    if (filterVerified === 'verified') {
      filtered = filtered.filter((reg) => reg.verified);
    } else if (filterVerified === 'unverified') {
      filtered = filtered.filter((reg) => !reg.verified);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'eventName':
          aValue = a.eventName;
          bValue = b.eventName;
          break;
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        case 'dateTime':
          aValue = new Date(a.dateTime).getTime();
          bValue = new Date(b.dateTime).getTime();
          break;
        case 'verified':
          aValue = a.verified ? 1 : 0;
          bValue = b.verified ? 1 : 0;
          break;
        case 'teamSize':
          aValue = a.teamUserIds.length;
          bValue = b.teamUserIds.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [localRegistrations, searchTerm, filterVerified, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleVerify = async (registrationId: string, currentStatus: boolean) => {
    setVerifyingId(registrationId);
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !currentStatus }),
      });

      if (response.ok) {
        const updatedReg = await response.json();
        setLocalRegistrations((prev) =>
          prev.map((reg) =>
            reg._id === registrationId ? { ...reg, verified: !currentStatus } : reg
          )
        );
      }
    } catch (error) {
      console.error('Error verifying registration:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? (
      <ChevronUp size={16} className="text-white" />
    ) : (
      <ChevronDown size={16} className="text-white" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by User ID, Event Name, or Event ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all"
            />
          </div>
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-4 py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all"
          >
            <option value="all" className="text-slate-900">📋 All Registrations</option>
            <option value="verified" className="text-slate-900">✓ Verified Only</option>
            <option value="unverified" className="text-slate-900">⏳ Pending Verification</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-lg border border-purple-500/20">
          <p className="text-sm text-slate-300 font-medium">
            📊 Showing <span className="font-bold text-white">{filteredAndSortedRegistrations.length}</span> of{' '}
            <span className="font-bold text-white">{localRegistrations.length}</span> registrations
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-400/25">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b-2 border-purple-500/20">
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('eventName')}
                  className="flex items-center gap-2 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-sm"
                >
                  🎭 Event
                  <SortIcon field="eventName" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('userId')}
                  className="flex items-center gap-2 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-sm"
                >
                  👤 User ID
                  <SortIcon field="userId" />
                </button>
              </th>
              <th className="px-4 py-4 text-center">
                <button
                  onClick={() => handleSort('teamSize')}
                  className="flex items-center gap-2 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-sm mx-auto"
                >
                  👥 Team
                  <SortIcon field="teamSize" />
                </button>
              </th>
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSort('dateTime')}
                  className="flex items-center gap-2 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-sm"
                >
                  📅 Date/Time
                  <SortIcon field="dateTime" />
                </button>
              </th>
              <th className="px-4 py-4 text-center">
                <button
                  onClick={() => handleSort('verified')}
                  className="flex items-center gap-2 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-sm mx-auto"
                >
                  ✓ Status
                  <SortIcon field="verified" />
                </button>
              </th>
              <th className="px-4 py-4 text-center text-white font-bold uppercase tracking-wider text-sm">
                📸 Receipt
              </th>
              <th className="px-4 py-4 text-center text-white font-bold uppercase tracking-wider text-sm">
                ⚙️ Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {filteredAndSortedRegistrations.length > 0 ? (
              filteredAndSortedRegistrations.map((registration) => (
                <tr
                  key={registration._id}
                  className="bg-slate-800/30 hover:bg-slate-700/30 transition-colors duration-300 border-b border-purple-500/10"
                >
                  {/* Event Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <span className="text-xl hidden sm:inline filter brightness-0 invert">🎪</span>
                      <div>
                        <p className="font-bold text-white">{registration.eventName}</p>
                        <p className="text-xs text-slate-400 mt-1">{registration.eventId}</p>
                      </div>
                    </div>
                  </td>

                  {/* User ID */}
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{registration.userId}</p>
                  </td>

                  {/* Team Size */}
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-lg border border-purple-500/30">
                      <span className="text-lg filter brightness-0 invert">👥</span>
                      <span className="font-bold text-white">
                        {registration.teamUserIds.length}
                      </span>
                    </div>
                  </td>

                  {/* Date/Time */}
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="font-semibold text-white">
                        {new Date(registration.dateTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(registration.dateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </td>

                  {/* Verification Status */}
                  <td className="px-4 py-4 text-center">
                    {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                      <>
                        {registration.verified ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-400/50">
                            <Check size={16} className="text-emerald-400" />
                            <span className="font-bold text-emerald-300 text-sm">Blessed</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-orange-900/50 px-3 py-1 rounded-lg border border-orange-400/50">
                            <X size={16} className="text-orange-400" />
                            <span className="font-bold text-orange-300 text-sm">Pending</span>
                          </div>
                        )}
                      </>
                    )}
                    {!canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                      <span className="text-slate-400 text-sm italic">—</span>
                    )}
                  </td>

                  {/* Receipt Image */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setSelectedImage(registration.feesPaid)}
                      className="inline-flex items-center gap-2 bg-purple-900/50 hover:bg-purple-900/80 px-3 py-2 rounded-lg border-2 border-purple-500/50 hover:border-purple-500 transition-all font-semibold text-purple-300 hover:text-purple-200 text-sm"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                      <button
                        onClick={() => handleVerify(registration._id, registration.verified)}
                        disabled={verifyingId === registration._id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold transition-all text-sm ${
                          registration.verified
                            ? 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 hover:border-red-400 text-red-300 hover:text-red-200 disabled:opacity-50'
                            : 'bg-green-900/50 hover:bg-green-900/80 border-green-400/50 hover:border-green-400 text-green-300 hover:text-green-200 disabled:opacity-50'
                        }`}
                      >
                        {verifyingId === registration._id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : registration.verified ? (
                          <X size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                        <span className="hidden sm:inline">
                          {registration.verified ? 'Curse' : 'Bless'}
                        </span>
                      </button>
                    )}
                    {!canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                      <span className="text-slate-400 text-sm italic">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="space-y-2">
                    <p className="text-2xl filter brightness-0 invert">🔍</p>
                    <p className="text-white font-semibold">No registrations found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image Enlargement Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-slate-900/50 rounded-3xl p-8 border-4 border-purple-500 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl filter brightness-0 invert">📸</span> Payment Receipt
                </h2>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-white hover:text-slate-300 text-3xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <img
                src={selectedImage}
                alt="Receipt"
                className="w-full rounded-2xl border-2 border-purple-500/50"
              />
              <div className="flex gap-4">
                <a
                  href={selectedImage}
                  download="receipt.png"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-center"
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
