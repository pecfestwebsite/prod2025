'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  ChevronDown,
  Loader,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
  Trash2,
} from 'lucide-react';
import { getAdminUser, canDeleteRegistrations, canVerifyRegistrations, filterRegistrationsByAccessLevel } from '@/lib/accessControl';

interface EventOption {
  eventId: string;
  eventName: string;
  societyName: string;
  isTeamEvent: boolean;
  regFees: number;
}

interface RegistrationWithDetails {
  _id: string;
  userId: string;
  eventId: string;
  teamId?: string;
  verified: boolean;
  feesPaid?: string; // Firebase Storage URL
  discount: number;
  accommodationRequired: boolean;
  accommodationMembers: number;
  accommodationFees: number;
  totalFees: number;
  dateTime: string;
  // Event details (fetched separately)
  eventName?: string;
  isTeamEvent?: boolean;
  category?: 'technical' | 'cultural' | 'convenor';
}

export default function EventRegistrationsClient() {
  const searchParams = useSearchParams();
  const [availableEvents, setAvailableEvents] = useState<EventOption[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<EventOption[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [eventRegistrations, setEventRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterAccommodation, setFilterAccommodation] = useState<'all' | 'required' | 'not-required'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Fetch registrations whenever filters change
  useEffect(() => {
    const fetchFilteredRegistrations = async () => {
      try {
        setLoadingRegistrations(true);
        
        const params = new URLSearchParams();
        
        // Add event filter if selected
        if (selectedEventId) {
          params.append('eventId', selectedEventId);
        }
        
        // Add filter parameters
        if (filterVerified !== 'all') {
          params.append('verified', filterVerified === 'verified' ? 'true' : 'false');
        }
        
        if (filterPaymentStatus !== 'all') {
          params.append('paymentStatus', filterPaymentStatus);
        }
        
        if (filterAccommodation !== 'all') {
          params.append('accommodation', filterAccommodation);
        }
        
        if (dateFrom) {
          params.append('dateFrom', dateFrom);
        }
        
        if (dateTo) {
          params.append('dateTo', dateTo);
        }
        
        // Important: include team members flag for event registrations page
        params.append('includeTeamMembers', 'true');
        params.append('limit', '10000'); // Fetch all records for this event
        
        const response = await fetch(`/api/registrations?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch registrations');
        
        const data = await response.json();
        
        let regsList: any[] = (data?.registrations || []).map((reg: any) => {
          // Find corresponding event details from available events
          const event = availableEvents.find(e => e.eventId === reg.eventId);
          return {
            _id: reg._id?.toString() || '',
            userId: reg.userId || '',
            eventId: reg.eventId || '',
            teamId: reg.teamId || undefined,
            verified: reg.verified || false,
            feesPaid: reg.feesPaid || undefined,
            discount: reg.discount || 0,
            accommodationRequired: reg.accommodationRequired || false,
            accommodationMembers: reg.accommodationMembers || 0,
            accommodationFees: reg.accommodationFees || 0,
            totalFees: reg.totalFees || 0,
            dateTime: reg.dateTime || '',
            eventName: reg.eventName || event?.eventName || '',
            societyName: event?.societyName || '',
            isTeamEvent: event?.isTeamEvent || false,
            category: reg.category || 'convenor',
          };
        });
        
        // Filter registrations based on access level
        const filteredRegs = filterRegistrationsByAccessLevel(regsList, adminUser);
        
        setEventRegistrations(filteredRegs);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoadingRegistrations(false);
      }
    };
    
    // Fetch whenever filter changes (but only if events are loaded)
    if (availableEvents.length > 0) {
      fetchFilteredRegistrations();
    }
  }, [selectedEventId, filterVerified, filterPaymentStatus, filterAccommodation, dateFrom, dateTo, availableEvents, adminUser]);

  // Fetch available events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        
        // Fetch events
        const eventsRes = await fetch('/api/events?limit=100');
        if (!eventsRes.ok) throw new Error('Failed to fetch events');
        const eventsData = await eventsRes.json();
        
        let eventsList: EventOption[] = [];
        if (eventsData?.events && Array.isArray(eventsData.events)) {
          eventsList = eventsData.events.map((event: any) => ({
            eventId: event.eventId || event._id?.toString() || '',
            eventName: event.eventName || '',
            societyName: event.societyName || '',
            isTeamEvent: event.isTeamEvent || false,
            regFees: event.regFees || 0,
          }));
        }
        
        // Filter events for club/soc admins (access level 1) to show only their club/soc events
        const admin = getAdminUser();
        if (admin && admin.accesslevel === 1 && admin.clubsoc) {
          eventsList = eventsList.filter(
            (event) => event.societyName === admin.clubsoc
          );
        }
        
        console.log('📌 Fetched events:', eventsList);
        setAvailableEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        setAvailableEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Get admin user from localStorage on mount
  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
  }, []);

  // Handle query parameter from view events page
  useEffect(() => {
    const eventParam = searchParams.get('event');
    if (eventParam) {
      try {
        const eventData = JSON.parse(decodeURIComponent(eventParam));
        if (eventData.eventId && eventData.eventName) {
          setSelectedEventId(eventData.eventId);
          setSearchInput(eventData.eventName);
        }
      } catch (error) {
        console.error('Error parsing event parameter:', error);
      }
    }
  }, [searchParams]);

  // Filter events based on search input
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredEvents([]);
      return;
    }
    const filtered = (Array.isArray(availableEvents) ? availableEvents : []).filter((event) =>
      event.eventName.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchInput, availableEvents]);


  // Get selected event details
  const selectedEvent = (Array.isArray(availableEvents) ? availableEvents : []).find(
    (e) => e.eventId === selectedEventId
  );

  // Group registrations by team (no additional filtering needed since API filters are applied)
  const groupedData = useMemo(() => {
    const teams = new Map<string, RegistrationWithDetails[]>();
    const individuals: RegistrationWithDetails[] = [];

    const regs = Array.isArray(eventRegistrations) ? eventRegistrations : [];
    
    regs.forEach((reg) => {
      if (reg.isTeamEvent && reg.teamId) {
        if (!teams.has(reg.teamId)) teams.set(reg.teamId, []);
        teams.get(reg.teamId)!.push(reg);
      } else {
        individuals.push(reg);
      }
    });

    return { teams, individuals };
  }, [eventRegistrations]);

  // Toggle team expansion
  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Handle verification toggle for registrations
  const handleVerifyRegistration = async (registrationId: string, verified: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ verified }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update registration');
      }

      // Update local state
      setEventRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === registrationId ? { ...reg, verified } : reg
        )
      );

      console.log(`✅ Registration ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating registration:', error);
      alert(`Failed to update registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (registrationId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this registration? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(registrationId);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
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
        setEventRegistrations((prev) => prev.filter((r) => r._id !== registrationId));
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

  // Export to CSV
  const exportToCSV = async () => {
    try {
      // Collect all unique user emails
      const userEmails = Array.from(new Set([
        ...Array.from(groupedData.teams.values()).flat().map(m => m.userId),
        ...groupedData.individuals.map(r => r.userId)
      ]));

      const userDetailsMap = new Map();
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Fetch user details in batches
      const batchSize = 10;
      for (let i = 0; i < userEmails.length; i += batchSize) {
        const batch = userEmails.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (email) => {
            try {
              // Fetch user from auth/me endpoint or direct API
              const response = await fetch(`/api/auth/user-details?email=${encodeURIComponent(email)}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.user) {
                  userDetailsMap.set(email, {
                    name: data.user.name || 'null',
                    email: email,
                    phone: data.user.phoneNumber || 'null',
                    college: data.user.college || 'null',
                    branch: data.user.branch || 'null',
                  });
                  return;
                }
              }
              
              // Fallback: set null values
              userDetailsMap.set(email, {
                name: 'null',
                email: email,
                phone: 'null',
                college: 'null',
                branch: 'null',
              });
            } catch (error) {
              console.error(`Failed to fetch user ${email}:`, error);
              userDetailsMap.set(email, {
                name: 'null',
                email: email,
                phone: 'null',
                college: 'null',
                branch: 'null',
              });
            }
          })
        );
      }

      // Helper function to format value - show 'null' for empty/undefined values
      const formatValue = (value: any) => {
        if (value === null || value === undefined || value === '' || value === 0) {
          return 'null';
        }
        return value;
      };

      let csv =
        'Team Number,User ID,Name,Email,Phone,College,Branch,Role,Event Name,Team ID,Accommodation Members,Accommodation Fees,Total Fees,Discount,Verification Status,Receipt Paid\n';

      let teamNumber = 1;

      // Add team registrations - leader first, then members grouped together
      groupedData.teams.forEach((members, teamId) => {
        // Team leader is the one with feesPaid value (non-empty)
        const teamLeader = members.find((m) => m.feesPaid) || members[0];
        const otherMembers = members.filter((m) => m !== teamLeader);
        
        // Add team leader
        const leaderDetails = userDetailsMap.get(teamLeader.userId) || { name: 'null', email: teamLeader.userId, phone: 'null', college: 'null', branch: 'null' };
        csv += `"${teamNumber}","${teamLeader.userId}","${formatValue(leaderDetails.name)}","${formatValue(leaderDetails.email)}","${formatValue(leaderDetails.phone)}","${formatValue(leaderDetails.college)}","${formatValue(leaderDetails.branch)}","Team Leader","${teamLeader.eventName || 'null'}","${teamId || 'null'}","${formatValue(teamLeader.accommodationMembers)}","${formatValue(teamLeader.accommodationFees)}","${formatValue(teamLeader.totalFees)}","${formatValue(teamLeader.discount)}","${teamLeader.verified ? 'Verified' : 'Pending'}","${teamLeader.feesPaid ? 'Yes' : 'No'}"\n`;
        
        // Add team members right after the leader - same team number
        otherMembers.forEach((member) => {
          const memberDetails = userDetailsMap.get(member.userId) || { name: 'null', email: member.userId, phone: 'null', college: 'null', branch: 'null' };
          csv += `"${teamNumber}","${member.userId}","${formatValue(memberDetails.name)}","${formatValue(memberDetails.email)}","${formatValue(memberDetails.phone)}","${formatValue(memberDetails.college)}","${formatValue(memberDetails.branch)}","Team Member","${member.eventName || 'null'}","${teamId || 'null'}","null","null","null","${formatValue(member.discount)}","${member.verified ? 'Verified' : 'Pending'}","${member.feesPaid ? 'Yes' : 'No'}"\n`;
        });
        
        teamNumber++;
      });

      // Add individual registrations
      groupedData.individuals.forEach((reg) => {
        const userDetails = userDetailsMap.get(reg.userId) || { name: 'null', email: reg.userId, phone: 'null', college: 'null', branch: 'null' };
        csv += `"${teamNumber}","${reg.userId}","${formatValue(userDetails.name)}","${formatValue(userDetails.email)}","${formatValue(userDetails.phone)}","${formatValue(userDetails.college)}","${formatValue(userDetails.branch)}","Individual","${reg.eventName || 'null'}","null","${formatValue(reg.accommodationMembers)}","${formatValue(reg.accommodationFees)}","${formatValue(reg.totalFees)}","${formatValue(reg.discount)}","${reg.verified ? 'Verified' : 'Pending'}","${reg.feesPaid ? 'Yes' : 'No'}"\n`;
        teamNumber++;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `registrations_${selectedEventId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export registrations. Please try again.');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Event Registrations
        </h1>
        <p className="text-slate-300">Search for an event and view registrations</p>
      </div>

      {/* Search Section */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 rounded-b-lg md:rounded-b-2xl px-4 md:px-6 py-4 md:py-5 space-y-3 md:space-y-4 shadow-lg -mx-4 md:-mx-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Input with Dropdown */}
          <div className="lg:col-span-4 relative">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Search Event (Select to auto-load registrations)
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Type event name..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setSelectedEventId('');
                        setEventRegistrations([]);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown with search results */}
              {showDropdown && searchInput && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-purple-500/40 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                  {filteredEvents && filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <button
                        key={event.eventId}
                        onClick={() => {
                          console.log('🎯 Selected event:', event);
                          setSelectedEventId(event.eventId);
                          setSearchInput(event.eventName);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-purple-500/20 hover:bg-slate-700/50 transition flex items-center justify-between ${
                          selectedEventId === event.eventId ? 'bg-slate-700/70' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{event.eventName}</p>
                          <p className="text-xs text-slate-400">
                            {event.societyName} • ₹{event.regFees}
                          </p>
                        </div>
                        <span className="text-xs bg-purple-600/50 px-2 py-1 rounded-full text-purple-100">
                          {event.isTeamEvent ? 'Team' : 'Individual'}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-400">
                      {availableEvents.length === 0 ? 'No events available' : 'No events found matching your search'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedEvent && (
          <div className="mt-4 p-4 bg-slate-800/40 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-slate-300">
              <span className="font-semibold">Selected Event:</span> {selectedEvent.eventName} •{' '}
              <span className="text-purple-300">
                {selectedEvent.isTeamEvent ? 'Team Event' : 'Individual Event'}
              </span>
            </p>
          </div>
        )}

        {/* Filters Row 1 - Status and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition text-sm shadow-md"
          >
            <option value="all" className="text-slate-900">📋 All Status</option>
            <option value="verified" className="text-slate-900">✓ Verified</option>
            <option value="unverified" className="text-slate-900">⏳ Pending</option>
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition text-sm shadow-md"
          >
            <option value="all" className="text-slate-900">💰 All Payments</option>
            <option value="paid" className="text-slate-900">✓ Paid</option>
            <option value="unpaid" className="text-slate-900">✗ Unpaid</option>
          </select>

          <select
            value={filterAccommodation}
            onChange={(e) => setFilterAccommodation(e.target.value as 'all' | 'required' | 'not-required')}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition text-sm shadow-md"
          >
            <option value="all" className="text-slate-900">🏨 All Accommodation</option>
            <option value="required" className="text-slate-900">✓ Required</option>
            <option value="not-required" className="text-slate-900">✗ Not Required</option>
          </select>
        </div>

        {/* Filters Row 2 - Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition text-sm shadow-md"
            placeholder="From Date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition text-sm shadow-md"
            placeholder="To Date"
          />
          {(dateFrom || dateTo || filterVerified !== 'all' || filterPaymentStatus !== 'all' || filterAccommodation !== 'all') && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setFilterVerified('all');
                setFilterPaymentStatus('all');
                setFilterAccommodation('all');
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Filter Info */}
        <div className="p-3 bg-slate-800/40 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-slate-300">
            📊 Showing <span className="font-bold text-white">{eventRegistrations.length}</span> registrations
          </p>
        </div>
      </div>

      {/* Results */}
      {eventRegistrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <Users className="w-16 h-16 text-slate-400/50 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-semibold">
              No registrations to display
            </p>
            <p className="text-slate-400 text-sm">
              Search for an event above to view registrations
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Export Button - Super Admins and Webmaster */}
          {(adminUser?.accesslevel === 2 || adminUser?.accesslevel === 3|| adminUser?.accesslevel === 1) && (
            <div className="flex justify-end">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Export to CSV
              </button>
            </div>
          )}

          {/* Table for registrations */}
          <div className="overflow-x-auto border-2 border-purple-500/30 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/40 border-b border-purple-500/30">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                    Team ID
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-200">
                    Accommodation
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-200">
                    Total Fees
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Team Registrations */}
                {Array.from(groupedData.teams.entries()).map(([teamId, members], teamIndex) => {
                    // Team leader is the one with feesPaid value (non-empty)
                    const teamLeader = members.find((m) => m.feesPaid) || members[0];
                    const otherMembers = members.filter((m) => m !== teamLeader);
                    
                    // Alternate background colors for team distinction
                    const teamBgColor = teamIndex % 2 === 0 ? 'bg-slate-800/10' : 'bg-blue-900/10';
                    
                    return (
                      <React.Fragment key={teamId}>
                        {/* Team Leader Row - Always Visible */}
                        <tr className={`${teamBgColor} border-b-2 border-purple-500/40 hover:bg-slate-800/30 transition font-semibold`}>
                          <td className="px-6 py-4 text-sm text-purple-300 font-mono">
                            {teamLeader.userId}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">{teamLeader.eventName}</td>
                          <td className="px-6 py-4 text-sm text-pink-300 font-mono">
                            <div className="flex flex-col gap-1">
                              <span className="bg-pink-600/50 px-2 py-1 rounded text-xs font-semibold">👑 LEADER</span>
                              <span>{teamId.slice(0, 12)}...</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                                {teamLeader.accommodationMembers} members
                              </span>
                              {teamLeader.accommodationFees > 0 && (
                                <span className="text-xs text-blue-300">
                                  ₹{teamLeader.accommodationFees}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-green-400 font-semibold">
                            ₹{teamLeader.totalFees}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <div className="flex flex-col items-center gap-3">
                              {/* Dropdown button for team members if exists - MOVED TO TOP */}
                              {otherMembers.length > 0 && (
                                <button
                                  onClick={() => toggleTeamExpansion(teamId)}
                                  className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded transition text-xs font-semibold text-slate-300 flex items-center gap-1"
                                  title={expandedTeams.has(teamId) ? 'Hide team members' : `Show ${otherMembers.length} team member${otherMembers.length !== 1 ? 's' : ''}`}
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      expandedTeams.has(teamId) ? 'rotate-180' : ''
                                    }`}
                                  />
                                  {otherMembers.length} Member{otherMembers.length !== 1 ? 's' : ''}
                                </button>
                              )}

                              {/* Payment Receipt Section */}
                              {teamLeader.feesPaid && (
                                <button
                                  onClick={() => {
                                    setSelectedReceiptUrl(teamLeader.feesPaid || null);
                                    setShowReceiptModal(true);
                                  }}
                                  className="text-xs bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 px-3 py-1 rounded flex items-center gap-1 transition"
                                  title="View payment receipt"
                                >
                                  <Download className="w-4 h-4" />
                                  Receipt
                                </button>
                              )}
                              
                              {/* Verification Status */}
                              <div className="flex items-center justify-center gap-2">
                                {teamLeader.verified ? (
                                  <span className="inline-flex items-center gap-1 bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                    <CheckCircle className="w-4 h-4" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                                    <AlertCircle className="w-4 h-4" />
                                    Pending
                                  </span>
                                )}
                              </div>

                              {/* Verification Toggle Buttons */}
                              {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                                <div className="flex gap-2">
                                  {!teamLeader.verified && (
                                    <button
                                      onClick={() => handleVerifyRegistration(teamLeader._id, true)}
                                      className="text-xs bg-green-600/50 hover:bg-green-600/70 text-green-200 px-3 py-1 rounded transition font-semibold"
                                      title="Mark as verified"
                                    >
                                      ✓ Verify
                                    </button>
                                  )}
                                  {teamLeader.verified && (
                                    <button
                                      onClick={() => handleVerifyRegistration(teamLeader._id, false)}
                                      className="text-xs bg-red-600/50 hover:bg-red-600/70 text-red-200 px-3 py-1 rounded transition font-semibold"
                                      title="Mark as unverified"
                                    >
                                      ✕ Unverify
                                    </button>
                                  )}
                                </div>
                              )}
                              {canDeleteRegistrations(adminUser?.accesslevel || 0) && (
                                <button
                                  onClick={() => handleDelete(teamLeader._id)}
                                  disabled={deletingId === teamLeader._id}
                                  className={`text-xs px-3 py-1 rounded transition font-semibold ${
                                    deletingId === teamLeader._id
                                      ? 'bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                                      : 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                                  }`}
                                  title="Delete registration (Webmaster only)"
                                >
                                  {deletingId === teamLeader._id ? (
                                    <Loader className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Team Members (Expandable) */}
                        {otherMembers.length > 0 && expandedTeams.has(teamId) &&
                          otherMembers.map((reg: RegistrationWithDetails) => (
                            <tr
                              key={reg._id}
                              className={`${teamBgColor} border-b border-purple-500/20 hover:bg-slate-800/20 transition`}
                            >
                              <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                {reg.userId}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">{reg.eventName}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                <div className="flex flex-col gap-1">
                                  <span className="bg-slate-700/50 px-2 py-1 rounded text-xs font-semibold">👤 MEMBER</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-center">
                                <div className="flex flex-col gap-1">
                                  {reg.accommodationMembers > 0 && (
                                    <>
                                      <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                                        {reg.accommodationMembers} members
                                      </span>
                                      {reg.accommodationFees > 0 && (
                                        <span className="text-xs text-blue-300">
                                          ₹{reg.accommodationFees}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-center text-green-400 font-semibold">
                                {reg.totalFees > 0 ? `₹${reg.totalFees}` : '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center">
                                <div className="flex flex-col items-center gap-2">
                                  {/* Verification Status */}
                                  <div className="flex items-center justify-center gap-2">
                                    {reg.verified ? (
                                      <span className="inline-flex items-center gap-1 bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                                        <AlertCircle className="w-4 h-4" />
                                        Pending
                                      </span>
                                    )}
                                  </div>

                                  {/* Verification Toggle Buttons */}
                                  {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                                    <div className="flex gap-2">
                                      {!reg.verified && (
                                        <button
                                          onClick={() => handleVerifyRegistration(reg._id, true)}
                                          className="text-xs bg-green-600/50 hover:bg-green-600/70 text-green-200 px-3 py-1 rounded transition font-semibold"
                                          title="Mark as verified"
                                        >
                                          ✓ Verify
                                        </button>
                                      )}
                                      {reg.verified && (
                                        <button
                                          onClick={() => handleVerifyRegistration(reg._id, false)}
                                          className="text-xs bg-red-600/50 hover:bg-red-600/70 text-red-200 px-3 py-1 rounded transition font-semibold"
                                          title="Mark as unverified"
                                        >
                                          ✕ Unverify
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {canDeleteRegistrations(adminUser?.accesslevel || 0) && (
                                    <button
                                      onClick={() => handleDelete(reg._id)}
                                      disabled={deletingId === reg._id}
                                      className={`text-xs px-3 py-1 rounded transition font-semibold ${
                                        deletingId === reg._id
                                          ? 'bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                                          : 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                                      }`}
                                      title="Delete registration (Webmaster only)"
                                    >
                                      {deletingId === reg._id ? (
                                        <Loader className="animate-spin w-4 h-4" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}

                {/* Individual Registrations */}
                {groupedData.individuals.map((reg: RegistrationWithDetails) => (
                  <tr
                    key={reg._id}
                    className="border-b border-purple-500/20 hover:bg-slate-800/20 transition"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono break-words max-w-xs">
                      {reg.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{reg.eventName}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      N/A
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {reg.accommodationMembers > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                            {reg.accommodationMembers} members
                          </span>
                          {reg.accommodationFees > 0 && (
                            <span className="text-xs text-blue-300">
                              ₹{reg.accommodationFees}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-400 font-semibold">
                      ₹{reg.totalFees}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex flex-col items-center gap-3">
                        {/* Payment Receipt Section */}
                        {reg.feesPaid && (
                          <button
                            onClick={() => {
                              setSelectedReceiptUrl(reg.feesPaid || null);
                              setShowReceiptModal(true);
                            }}
                            className="text-xs bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 px-3 py-1 rounded flex items-center gap-1 transition"
                            title="View payment receipt"
                          >
                            <Download className="w-4 h-4" />
                            Receipt
                          </button>
                        )}

                        {/* Verification Status */}
                        <div className="flex items-center justify-center gap-2">
                          {reg.verified ? (
                            <span className="inline-flex items-center gap-1 bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Verification Toggle Buttons */}
                        {canVerifyRegistrations(adminUser?.accesslevel || 0) && (
                          <div className="flex gap-2">
                            {!reg.verified && (
                              <button
                                onClick={() => handleVerifyRegistration(reg._id, true)}
                                className="text-xs bg-green-600/50 hover:bg-green-600/70 text-green-200 px-3 py-1 rounded transition font-semibold"
                                title="Mark as verified"
                              >
                                ✓ Verify
                              </button>
                            )}
                            {reg.verified && (
                              <button
                                onClick={() => handleVerifyRegistration(reg._id, false)}
                                className="text-xs bg-red-600/50 hover:bg-red-600/70 text-red-200 px-3 py-1 rounded transition font-semibold"
                                title="Mark as unverified"
                              >
                                ✕ Unverify
                              </button>
                            )}
                          </div>
                        )}
                        {canDeleteRegistrations(adminUser?.accesslevel || 0) && (
                          <button
                            onClick={() => handleDelete(reg._id)}
                            disabled={deletingId === reg._id}
                            className={`text-xs px-3 py-1 rounded transition font-semibold ${
                              deletingId === reg._id
                                ? 'bg-gray-900/50 border-gray-400/50 text-gray-300 cursor-not-allowed'
                                : 'bg-red-900/50 hover:bg-red-900/80 border-red-400/50 text-red-300'
                            }`}
                            title="Delete registration (Webmaster only)"
                          >
                            {deletingId === reg._id ? (
                              <Loader className="animate-spin w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border-2 border-purple-500/30 rounded-lg p-4">
              <p className="text-xs text-slate-400">Total Registrations</p>
              <p className="text-3xl font-bold text-purple-300">{eventRegistrations.length}</p>
            </div>
            {selectedEvent?.isTeamEvent && (
              <div className="bg-slate-800/40 border-2 border-purple-500/30 rounded-lg p-4">
                <p className="text-xs text-slate-400">Teams</p>
                <p className="text-3xl font-bold text-pink-300">{groupedData.teams.size}</p>
              </div>
            )}
            <div className="bg-slate-800/40 border-2 border-purple-500/30 rounded-lg p-4">
              <p className="text-xs text-slate-400">Verified</p>
              <p className="text-3xl font-bold text-green-400">
                {eventRegistrations.filter((r) => r.verified).length}
              </p>
            </div>
            <div className="bg-slate-800/40 border-2 border-purple-500/30 rounded-lg p-4">
              <p className="text-xs text-slate-400">Pending</p>
              <p className="text-3xl font-bold text-yellow-400">
                {eventRegistrations.filter((r) => !r.verified).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceiptUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-500/40 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/20 bg-slate-900">
              <h3 className="text-xl font-bold text-white">Payment Receipt</h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceiptUrl(null);
                }}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-slate-800/40 rounded-lg overflow-hidden border border-purple-500/20">
                {selectedReceiptUrl.includes('firebasestorage') || selectedReceiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={selectedReceiptUrl}
                    alt="Payment Receipt"
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="18"%3EReceipt Not Available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-slate-400">
                    <p>Receipt file format not supported</p>
                  </div>
                )}
              </div>

              {/* Download Link */}
              <div className="mt-4">
                <a
                  href={selectedReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
