'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Eye, Check, X, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { getAdminUser, canVerifyRegistrations, filterRegistrationsByAccessLevel, canDeleteRegistrations } from '@/lib/accessControl';
import ImageModal from '@/components/ImageModal';

interface RegistrationWithEvent {
  _id: string;
  eventId: string;
  eventName: string;
  userId: string;
  teamId: string;
  verified: boolean;
  feesPaid: string;
  dateTime: string;
  createdAt: string;
  societyName?: string;
  discount?: number;
  accommodationMembers?: number;
  totalFees?: number;
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

type SortField = 'eventName' | 'eventId' | 'userId' | 'teamId' | 'dateTime' | 'verified' | 'discount' | 'accommodationMembers' | 'totalFees' | 'teamSize';
type SortOrder = 'asc' | 'desc';

const STORAGE_KEY = 'registration_action_count';
const SESSION_KEY = 'admin_session_token';
const MAX_ACTIONS_PER_REGISTRATION = 2;

// Helper functions for localStorage management
const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  } catch {
    return null;
  }
};

const getSavedSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const saveSessionToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    // Handle error silently
  }
};

const getActionCount = (registrationId: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const counts = data ? JSON.parse(data) : {};
    return counts[registrationId] || 0;
  } catch {
    return 0;
  }
};

const incrementActionCount = (registrationId: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const counts = data ? JSON.parse(data) : {};
    counts[registrationId] = (counts[registrationId] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    return counts[registrationId];
  } catch {
    return 0;
  }
};

const clearActionCounts = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Handle error silently
  }
};

export default function RegistrationsClient({ registrations }: RegistrationsClientProps) {
  const [sortField, setSortField] = useState<SortField>('dateTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [localRegistrations, setLocalRegistrations] = useState<RegistrationWithEvent[]>(registrations);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [actionCounts, setActionCounts] = useState<{ [key: string]: number }>({});
  const [warningRegistrations, setWarningRegistrations] = useState<Set<string>>(new Set());
  const [showWarningModal, setShowWarningModal] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
  }, []);

  // Check for session changes and initialize action counts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentToken = getSessionToken();
    const savedToken = getSavedSessionToken();

    console.log('Current Token:', currentToken?.substring(0, 20) + '...');
    console.log('Saved Token:', savedToken?.substring(0, 20) + '...');

    // If tokens don't match, it's a new session - clear the action counts
    if (currentToken && currentToken !== savedToken) {
      console.log('Session changed - clearing action counts');
      clearActionCounts();
      setActionCounts({});
      saveSessionToken(currentToken);
    } else if (currentToken && !savedToken) {
      // First time - save the token and initialize
      console.log('First session - initializing');
      saveSessionToken(currentToken);
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const counts = data ? JSON.parse(data) : {};
        setActionCounts(counts);
      } catch {
        setActionCounts({});
      }
    } else if (currentToken && savedToken === currentToken) {
      // Same session - load existing counts
      console.log('Same session - loading existing counts');
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const counts = data ? JSON.parse(data) : {};
        setActionCounts(counts);
      } catch {
        setActionCounts({});
      }
    } else {
      // No token found
      console.log('No token found');
      setActionCounts({});
    }
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
        case 'eventId':
          aValue = a.eventId;
          bValue = b.eventId;
          break;
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        case 'teamId':
          aValue = a.teamId;
          bValue = b.teamId;
          break;
        case 'dateTime':
          aValue = new Date(a.dateTime).getTime();
          bValue = new Date(b.dateTime).getTime();
          break;
        case 'verified':
          aValue = a.verified ? 1 : 0;
          bValue = b.verified ? 1 : 0;
          break;
        case 'discount':
          aValue = a.discount || 0;
          bValue = b.discount || 0;
          break;
        case 'accommodationMembers':
          aValue = a.accommodationMembers || 0;
          bValue = b.accommodationMembers || 0;
          break;
        case 'totalFees':
          aValue = a.totalFees || 0;
          bValue = b.totalFees || 0;
          break;
        case 'teamSize':
          // Sort by whether teamId exists and alphabetically
          aValue = a.teamId ? 1 : 0;
          bValue = b.teamId ? 1 : 0;
          if (aValue !== bValue) break;
          aValue = a.teamId.localeCompare(b.teamId);
          bValue = 0;
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
    // Check if action limit is reached
    const currentCount = actionCounts[registrationId] || 0;
    
    if (currentCount >= MAX_ACTIONS_PER_REGISTRATION) {
      setShowWarningModal(registrationId);
      return;
    }

    // If this is the last action before hitting the limit, add to warning set
    if (currentCount === MAX_ACTIONS_PER_REGISTRATION - 1) {
      setWarningRegistrations(prev => new Set([...prev, registrationId]));
    }

    setVerifyingId(registrationId);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No admin token found');
        alert('Session expired. Please login again.');
        setVerifyingId(null);
        return;
      }

      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

        // Increment action count
        const newCount = incrementActionCount(registrationId);
        setActionCounts(prev => ({
          ...prev,
          [registrationId]: newCount
        }));
      }
    } catch (error) {
      console.error('Error verifying registration:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (registrationId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this registration? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(registrationId);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No admin token found');
        alert('Session expired. Please login again.');
        setDeletingId(null);
        return;
      }

      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the registration from the local list
        setLocalRegistrations((prev) =>
          prev.filter((reg) => reg._id !== registrationId)
        );
        alert('Registration deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete registration: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('An error occurred while deleting the registration.');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
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

  const isActionDisabled = (registrationId: string): boolean => {
    return (actionCounts[registrationId] || 0) >= MAX_ACTIONS_PER_REGISTRATION;
  };

  const getActionCountDisplay = (registrationId: string): string => {
    const count = actionCounts[registrationId] || 0;
    return `${count}/${MAX_ACTIONS_PER_REGISTRATION}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Floating Search and Filter Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 rounded-b-lg md:rounded-b-2xl px-4 md:px-6 py-4 md:py-5 space-y-3 md:space-y-4 shadow-lg -mx-4 md:-mx-6">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by User ID, Event Name, or Event ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all text-xs md:text-base shadow-md"
            />
          </div>
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-3 md:px-4 py-2 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all text-xs md:text-base shadow-md"
          >
            <option value="all" className="text-slate-900">📋 All Registrations</option>
            <option value="verified" className="text-slate-900">✓ Verified Only</option>
            <option value="unverified" className="text-slate-900">⏳ Pending Verification</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-800/40 border border-purple-500/20 rounded-lg">
          <p className="text-xs md:text-sm text-slate-300 font-medium">
            📊 Showing <span className="font-bold text-white">{filteredAndSortedRegistrations.length}</span> of{' '}
            <span className="font-bold text-white">{localRegistrations.length}</span> registrations
          </p>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedRegistrations.length > 0 ? (
          filteredAndSortedRegistrations.map((registration) => (
            <div
              key={registration._id}
              className="bg-slate-800/40 border-2 border-purple-500/30 rounded-xl p-4 space-y-3"
            >
              {/* Event */}
              <div className="border-b border-purple-500/20 pb-3">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">🎭 Event</p>
                <p className="font-bold text-white text-sm">{registration.eventName}</p>
                <p className="text-xs text-slate-400">{registration.eventId}</p>
              </div>

              {/* User */}
              <div className="border-b border-purple-500/20 pb-3">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">👤 User ID</p>
                <p className="font-semibold text-white text-sm">{registration.userId}</p>
              </div>

              {/* Date */}
              <div className="border-b border-purple-500/20 pb-3">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">📅 Date</p>
                <p className="text-sm text-white">
                  {new Date(registration.dateTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Discount */}
              {registration.discount ? (
                <div className="border-b border-purple-500/20 pb-3">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">💰 Discount</p>
                  <p className="font-bold text-emerald-400 text-sm">₹{registration.discount}</p>
                </div>
              ) : null}

              {/* Accommodation */}
              {registration.accommodationMembers ? (
                <div className="border-b border-purple-500/20 pb-3">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">🏨 Accommodation</p>
                  <p className="font-bold text-white text-sm">{registration.accommodationMembers} members</p>
                </div>
              ) : null}

              {/* Total Fees */}
              <div className="border-b border-purple-500/20 pb-3">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">💵 Total Fees</p>
                <p className="font-bold text-emerald-300 text-sm">₹{registration.totalFees || 0}</p>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div>
                  {registration.verified ? (
                    <div className="inline-flex items-center gap-1 bg-emerald-900/50 px-2 py-1 rounded-lg border border-emerald-400/50">
                      <Check size={14} className="text-emerald-400" />
                      <span className="font-bold text-emerald-300 text-xs">Blessed</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-orange-900/50 px-2 py-1 rounded-lg border border-orange-400/50">
                      <X size={14} className="text-orange-400" />
                      <span className="font-bold text-orange-300 text-xs">Pending</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(registration.feesPaid)}
                  className="inline-flex items-center gap-1 bg-purple-900/50 hover:bg-purple-900/80 px-2 py-1 rounded-lg border border-purple-500/50 text-purple-300 text-xs"
                >
                  <Eye size={14} />
                  View
                </button>
              </div>

              {/* Verify Button */}
              {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleVerify(registration._id, registration.verified)}
                    disabled={verifyingId === registration._id || isActionDisabled(registration._id)}
                    className={`w-full py-2 rounded-lg border-2 font-bold transition-all text-sm ${
                      isActionDisabled(registration._id)
                        ? 'bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                        : registration.verified
                        ? 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                        : 'bg-emerald-900/50 hover:bg-emerald-900/80 border-emerald-400/50 text-emerald-300'
                    } disabled:opacity-50`}
                  >
                    {verifyingId === registration._id ? (
                      <Loader size={16} className="inline animate-spin mr-2" />
                    ) : isActionDisabled(registration._id) ? (
                      'Action Limit Reached'
                    ) : registration.verified ? (
                      'Unverify'
                    ) : (
                      'Verify'
                    )}
                  </button>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-500/30">
                    <span className="text-xs text-slate-400">Actions used:</span>
                    <span className={`text-xs font-bold ${warningRegistrations.has(registration._id) ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {getActionCountDisplay(registration._id)}
                    </span>
                  </div>
                  {warningRegistrations.has(registration._id) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                      <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-xs text-yellow-300">Last action available for this registration</span>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Button - Webmaster Only */}
              {canDeleteRegistrations(adminUser?.accesslevel || 0) && (
                <button
                  onClick={() => handleDelete(registration._id)}
                  disabled={deletingId === registration._id}
                  className={`w-full py-2 rounded-lg border-2 font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                    deletingId === registration._id
                      ? 'bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                      : 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                  } disabled:opacity-50`}
                >
                  {deletingId === registration._id ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 font-semibold">No registrations found</p>
          </div>
        )}
      </div>

      {/* Desktop View - Optimized Compact Table */}
      <div className="hidden md:block rounded-2xl border-2 border-slate-400/25 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b-2 border-purple-500/20">
                <th className="px-2 py-3 text-left">
                  <button
                    onClick={() => handleSort('eventId')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs"
                  >
                    Event ID
                    <SortIcon field="eventId" />
                  </button>
                </th>
                <th className="px-2 py-3 text-left">
                  <button
                    onClick={() => handleSort('userId')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs"
                  >
                    User ID
                    <SortIcon field="userId" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleSort('teamId')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs mx-auto"
                  >
                    Team ID
                    <SortIcon field="teamId" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center text-white font-bold uppercase tracking-wider text-xs">
                  Receipt
                </th>
                <th className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleSort('discount')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs mx-auto"
                  >
                    Discount
                    <SortIcon field="discount" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleSort('accommodationMembers')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs mx-auto"
                  >
                    Accom.
                    <SortIcon field="accommodationMembers" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleSort('totalFees')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs mx-auto"
                  >
                    Total Fees
                    <SortIcon field="totalFees" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleSort('verified')}
                    className="flex items-center gap-1 text-white font-bold hover:text-slate-300 transition-colors uppercase tracking-wider text-xs mx-auto"
                  >
                    Status
                    <SortIcon field="verified" />
                  </button>
                </th>
                <th className="px-2 py-3 text-center text-white font-bold uppercase tracking-wider text-xs">
                  Actions
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
                    {/* Event ID */}
                    <td className="px-2 py-3">
                      <p className="font-semibold text-white text-xs truncate">{registration.eventId}</p>
                    </td>

                    {/* User ID */}
                    <td className="px-2 py-3">
                      <p className="font-semibold text-white text-xs truncate">{registration.userId}</p>
                    </td>

                    {/* Team ID */}
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => setSelectedTeamId(registration.teamId)}
                        className="inline text-xs font-semibold text-slate-200 bg-slate-700/50 hover:bg-slate-700/80 px-2 py-1 rounded cursor-pointer transition-all hover:text-purple-300"
                        title="Click to see full Team ID"
                      >
                        {registration.teamId ? registration.teamId.substring(0, 6) + '...' : '-'}
                      </button>
                    </td>

                    {/* Receipt */}
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => setSelectedImage(registration.feesPaid)}
                        className="inline-flex items-center justify-center bg-purple-900/50 hover:bg-purple-900/80 px-2 py-1 rounded border border-purple-500/50 text-purple-300 text-xs transition-all"
                        title="View receipt"
                      >
                        <Eye size={12} />
                      </button>
                    </td>

                    {/* Discount */}
                    <td className="px-2 py-3 text-center">
                      <p className="font-semibold text-white text-xs">
                        {registration.discount ? `₹${registration.discount}` : '-'}
                      </p>
                    </td>

                    {/* Accommodation Members */}
                    <td className="px-2 py-3 text-center">
                      <p className="font-semibold text-white text-xs">
                        {registration.accommodationMembers ? `${registration.accommodationMembers}` : '-'}
                      </p>
                    </td>

                    {/* Total Fees */}
                    <td className="px-2 py-3 text-center">
                      <p className="font-bold text-emerald-300 text-xs">
                        ₹{registration.totalFees || 0}
                      </p>
                    </td>

                    {/* Verification Status */}
                    <td className="px-2 py-3 text-center">
                      {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                        <>
                          {registration.verified ? (
                            <div className="inline-flex items-center gap-1 bg-emerald-900/50 px-2 py-1 rounded border border-emerald-400/50">
                              <Check size={12} className="text-emerald-400" />
                              <span className="font-bold text-emerald-300 text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-orange-900/50 px-2 py-1 rounded border border-orange-400/50">
                              <X size={12} className="text-orange-400" />
                              <span className="font-bold text-orange-300 text-xs">⏳</span>
                            </div>
                          )}
                        </>
                      )}
                      {!canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                          <>
                            <button
                              onClick={() => handleVerify(registration._id, registration.verified)}
                              disabled={verifyingId === registration._id || isActionDisabled(registration._id)}
                              title={isActionDisabled(registration._id) ? 'Action limit reached' : ''}
                              className={`inline-flex items-center justify-center px-2 py-1 rounded border text-xs font-bold transition-all ${
                                isActionDisabled(registration._id)
                                  ? 'bg-gray-900/50 hover:bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                                  : registration.verified
                                  ? 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                                  : 'bg-emerald-900/50 hover:bg-emerald-900/80 border-emerald-400/50 text-emerald-300'
                              } disabled:opacity-50`}
                            >
                              {verifyingId === registration._id ? (
                                <Loader size={10} className="animate-spin" />
                              ) : registration.verified ? (
                                <X size={10} />
                              ) : (
                                <Check size={10} />
                              )}
                            </button>
                            <span className={`text-xs font-semibold px-1 rounded text-center min-w-6 ${warningRegistrations.has(registration._id) ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800/50 text-slate-400'}`}>
                              {getActionCountDisplay(registration._id)}
                            </span>
                          </>
                        )}
                        {canDeleteRegistrations(adminUser?.accesslevel || 0) && (
                          <button
                            onClick={() => handleDelete(registration._id)}
                            disabled={deletingId === registration._id}
                            title="Delete registration (Webmaster only)"
                            className={`inline-flex items-center justify-center px-2 py-1 rounded border text-xs font-bold transition-all ${
                              deletingId === registration._id
                                ? 'bg-gray-900/50 hover:bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                                : 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                            } disabled:opacity-50`}
                          >
                            {deletingId === registration._id ? (
                              <Loader size={10} className="animate-spin" />
                            ) : (
                              <Trash2 size={10} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <p className="text-white font-semibold">No registrations found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* Team ID Modal */}
      {selectedTeamId && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTeamId(null)}
        >
          <div
            className="bg-slate-900/50 rounded-3xl p-8 border-4 border-purple-500 shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🏷️</span> Team ID
                </h2>
                <button
                  onClick={() => setSelectedTeamId(null)}
                  className="text-white hover:text-slate-300 text-3xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-slate-800/50 border-2 border-purple-500/50 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <code className="flex-1 text-white text-lg font-mono break-all">
                    {selectedTeamId}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTeamId || '');
                      alert('Team ID copied to clipboard!');
                    }}
                    className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all whitespace-nowrap"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedTeamId(null)}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Limit Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowWarningModal(null)}
        >
          <div
            className="bg-slate-900/50 rounded-3xl p-8 border-4 border-red-500 shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="bg-red-900/50 p-4 rounded-full border-2 border-red-500">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-white">Action Limit Reached</h2>
                <p className="text-slate-300">
                  You have used all <span className="font-bold text-yellow-400">{MAX_ACTIONS_PER_REGISTRATION}</span> available actions for this registration in this session.
                </p>
                <p className="text-slate-400 text-sm">
                  No further verify/unverify actions can be performed until you log in again.
                </p>
              </div>

              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 px-4 py-3 rounded">
                <p className="text-yellow-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  Actions are limited per registration per session for security.
                </p>
              </div>

              <button
                onClick={() => setShowWarningModal(null)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
