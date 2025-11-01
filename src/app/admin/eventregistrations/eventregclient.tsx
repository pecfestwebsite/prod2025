'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Loader,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
} from 'lucide-react';

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
}

export default function EventRegistrationsClient() {
  const [availableEvents, setAvailableEvents] = useState<EventOption[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<EventOption[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [eventRegistrations, setEventRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);

  // Fetch available events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await fetch('/api/events?limit=100');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        
        // The API returns { events, pagination }
        let eventsList: EventOption[] = [];
        if (data?.events && Array.isArray(data.events)) {
          eventsList = data.events.map((event: any) => ({
            eventId: event.eventId || event._id?.toString() || '',
            eventName: event.eventName || '',
            societyName: event.societyName || '',
            isTeamEvent: event.isTeamEvent || false,
            regFees: event.regFees || 0,
          }));
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

  // Handle search button click
  const handleSearch = async () => {
    if (!selectedEventId) return;

    setLoadingRegistrations(true);
    try {
      const res = await fetch(`/api/registrations?eventId=${selectedEventId}&limit=1000`);
      const data = await res.json();
      
      // The API returns { registrations, total, pagination }
      let regsList: RegistrationWithDetails[] = [];
      if (data?.registrations && Array.isArray(data.registrations)) {
        // Get the selected event details for eventName and isTeamEvent
        const eventData = selectedEvent;
        
        regsList = data.registrations.map((reg: any) => ({
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
          // Add event details from selectedEvent
          eventName: eventData?.eventName || '',
          isTeamEvent: eventData?.isTeamEvent || false,
        }));
      }
      
      console.log('📋 Fetched registrations:', regsList);
      setEventRegistrations(regsList);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setEventRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Get selected event details
  const selectedEvent = (Array.isArray(availableEvents) ? availableEvents : []).find(
    (e) => e.eventId === selectedEventId
  );

  // Group registrations by team
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

  // Export to CSV
  const exportToCSV = () => {
    let csv =
      'User ID,Role,Event Name,Team ID,Accommodation Members,Accommodation Fees,Total Fees,Discount,Verification Status,Receipt Paid\n';

    // Add team registrations - leader first, then members grouped together
    groupedData.teams.forEach((members, teamId) => {
      const teamLeader = members[0];
      const otherMembers = members.slice(1);
      
      // Add team leader
      csv += `"${teamLeader.userId}","Team Leader","${teamLeader.eventName}","${teamId}","${teamLeader.accommodationMembers}","${teamLeader.accommodationFees}","${teamLeader.totalFees}","${teamLeader.discount}","${teamLeader.verified ? 'Verified' : 'Pending'}","${teamLeader.feesPaid ? 'Yes' : 'No'}"\n`;
      
      // Add team members right after the leader
      otherMembers.forEach((member) => {
        csv += `"${member.userId}","Team Member","${member.eventName}","${teamId}","—","—","—","${member.discount}","${member.verified ? 'Verified' : 'Pending'}","${member.feesPaid ? 'Yes' : 'No'}"\n`;
      });
    });

    // Add individual registrations
    groupedData.individuals.forEach((reg) => {
      csv += `"${reg.userId}","Individual","${reg.eventName}","N/A","${reg.accommodationMembers}","${reg.accommodationFees}","${reg.totalFees}","${reg.discount}","${reg.verified ? 'Verified' : 'Pending'}","${reg.feesPaid ? 'Yes' : 'No'}"\n`;
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
          <div className="lg:col-span-3 relative">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Search Event
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

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!selectedEventId || loadingRegistrations}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 disabled:hover:scale-100"
            >
              {loadingRegistrations ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
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
          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export to CSV
            </button>
          </div>

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
                {selectedEvent?.isTeamEvent &&
                  Array.from(groupedData.teams.entries()).map(([teamId, members]) => {
                    // Team leader is the first member (or we can find by feesPaid status)
                    const teamLeader = members[0];
                    const otherMembers = members.slice(1);
                    
                    return (
                      <React.Fragment key={teamId}>
                        {/* Team Leader Row - Always Visible */}
                        <tr className="bg-slate-800/20 border-b border-purple-500/20 hover:bg-slate-800/30 transition font-semibold">
                          <td className="px-6 py-4 text-sm text-purple-300 font-mono">
                            {teamLeader.userId}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">{teamLeader.eventName}</td>
                          <td className="px-6 py-4 text-sm text-pink-300 font-mono">
                            {teamId.slice(0, 12)}...
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
                              {/* Dropdown button for team members if exists */}
                              {otherMembers.length > 0 && (
                                <button
                                  onClick={() => toggleTeamExpansion(teamId)}
                                  className="ml-2 p-1 hover:bg-slate-700/50 rounded transition"
                                  title={expandedTeams.has(teamId) ? 'Hide team members' : `Show ${otherMembers.length} team member${otherMembers.length !== 1 ? 's' : ''}`}
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform ${
                                      expandedTeams.has(teamId) ? 'rotate-180' : ''
                                    }`}
                                  />
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
                              className="border-b border-purple-500/20 hover:bg-slate-800/20 transition bg-slate-900/20"
                            >
                              <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                {reg.userId}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">{reg.eventName}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                └─ Member
                              </td>
                              <td className="px-6 py-4 text-sm text-center text-slate-400">
                                —
                              </td>
                              <td className="px-6 py-4 text-sm text-center text-slate-400">
                                —
                              </td>
                              <td className="px-6 py-4 text-sm text-center">
                                {reg.verified ? (
                                  <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto" />
                                )}
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
    </div>
  );
}
