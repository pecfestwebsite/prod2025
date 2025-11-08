'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, ChevronUp, ChevronDown, Percent } from 'lucide-react';
import EditEventModal from '@/components/EditEventModal';
import DeleteEventModal from '@/components/DeleteEventModal';
import CreateDiscountModal from '@/components/CreateDiscountModal';
import { getAdminUser, filterEventsByAccessLevel, canDeleteEvent, canEditEvent, canDeleteEventByAdmin, canEditEventByAdmin, canManageDiscounts } from '@/lib/accessControl';

interface Event {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  additionalClub?: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  endDateTime: string;
  location: string;
  briefDescription: string;
  contactInfo: string;
  isTeamEvent: boolean;
  minTeamMembers: number;
  maxTeamMembers: number;
  pdfLink: string;
  image: string;
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

type SortField = 'eventName' | 'category' | 'societyName' | 'regFees' | 'dateTime' | 'isTeamEvent';
type SortOrder = 'asc' | 'desc';

export default function ViewEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('dateTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTableCard, setShowTableCard] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedEventForDiscount, setSelectedEventForDiscount] = useState<Event | null>(null);

  // Fetch events
  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
    fetchEvents();
  }, []);

  // Filter and sort events
  useEffect(() => {
    let result = [...events];

    // Apply access level filtering first
    result = filterEventsByAccessLevel(result, adminUser);

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(event => event.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort events
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dateTime') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredEvents(result);
  }, [events, selectedCategory, searchTerm, sortField, sortOrder, adminUser]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?limit=100');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = (event: Event) => {
    setDeletingEvent(event);
    setShowDeleteModal(true);
  };

  const handleCreateDiscount = (event: Event) => {
    setSelectedEventForDiscount(event);
    setShowDiscountModal(true);
  };

  const handleViewRegistrations = (event: Event) => {
    // Navigate to event registrations page and pass event data
    const eventData = encodeURIComponent(JSON.stringify({
      eventId: event.eventId,
      eventName: event.eventName,
    }));
    router.push(`/admin/eventregistrations?event=${eventData}`);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const onEventUpdated = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const onEventDeleted = () => {
    setShowDeleteModal(false);
    setDeletingEvent(null);
    fetchEvents();
  };

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSortChange(field)}
      className="flex items-center gap-2 font-semibold text-white hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
    >
      {label}
      {sortField === field && (
        <span className="flex-shrink-0">
          {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      )}
    </button>
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
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">📚</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Event Mystique
            </h1>
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">✨</span>
          </div>
          <p className="mt-3 text-lg text-slate-300 font-medium italic">
            ✧ Manage and explore your magical creations ✧
          </p>

          {/* Stats Cards */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl ">📊</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Events
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {events.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-cyan-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">⚙️</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Technical
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {events.filter(e => e.category === 'technical').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-900 to-rose-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl ">🎨</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Cultural
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {events.filter(e => e.category === 'cultural').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          {/* Floating Search and Filter Bar */}
          <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 rounded-b-lg md:rounded-b-2xl px-4 md:px-6 py-4 md:py-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search by event name, society, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all text-sm md:text-base shadow-md"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all text-sm md:text-base shadow-md"
                >
                  <option value="all" className="text-slate-900">📊 All Categories</option>
                  <option value="technical" className="text-slate-900">⚙️ Technical</option>
                  <option value="cultural" className="text-slate-900">🎨 Cultural</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 p-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl filter brightness-0 invert">🌙</span>
                </div>
              </div>
              <p className="mt-4 text-slate-300 font-semibold animate-pulse">Unveiling the mystical scrolls...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 p-6">
              <p className="text-white text-xl font-bold mb-2">🌙 No events found</p>
              <p className="text-slate-300 text-sm">Try adjusting your filters or create a new event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b-2 border-purple-500/20">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left">
                      <SortableHeader field="eventName" label="Event" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left hidden sm:table-cell">
                      <SortableHeader field="category" label="Category" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left hidden md:table-cell">
                      <SortableHeader field="societyName" label="Society" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left hidden lg:table-cell">
                      <SortableHeader field="dateTime" label="Date" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left hidden md:table-cell">
                      <SortableHeader field="regFees" label="Fees" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left hidden lg:table-cell">
                      <SortableHeader field="isTeamEvent" label="Type" />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-center font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredEvents.map((event, index) => (
                    <tr
                      key={event._id}
                      className={`hover:bg-purple-500/5 transition-all ${
                        index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-700/20'
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => handleViewRegistrations(event)}
                          className="text-left hover:text-purple-300 transition-colors cursor-pointer group"
                          title="Click to view registrations for this event"
                        >
                          <div className="font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                            {event.eventName}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            ID: {event.eventId}
                          </div>
                        </button>
                        <div className="sm:hidden mt-2 space-y-1 text-xs">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            event.category === 'technical'
                              ? 'bg-blue-600/30 text-blue-100'
                              : event.category === 'cultural'
                              ? 'bg-pink-600/30 text-pink-100'
                              : 'bg-purple-600/30 text-purple-100'
                          }`}>
                            {event.category === 'technical' && '⚙️ Tech'}
                            {event.category === 'cultural' && '🎨 Cultural'}
                            {event.category === 'convenor' && '👑 Convenor'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          event.category === 'technical'
                            ? 'bg-blue-600/30 text-blue-100'
                            : event.category === 'cultural'
                            ? 'bg-pink-600/30 text-pink-100'
                            : 'bg-purple-600/30 text-purple-100'
                        }`}>
                          {event.category === 'technical' && '⚙️ Tech'}
                          {event.category === 'cultural' && '🎨 Cultural'}
                          {event.category === 'convenor' && '👑 Convenor'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-white truncate">
                        <div>
                          <div>{event.societyName}</div>
                          {event.additionalClub && event.additionalClub !== 'None' && (
                            <div className="text-xs text-purple-300 mt-1">+ {event.additionalClub}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-slate-300 text-xs">
                        {(() => {
                          const startDate = new Date(event.dateTime);
                          const endDate = new Date(event.endDateTime);
                          const startDateStr = startDate.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          });
                          const endDateStr = endDate.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          });
                          const startTime = startDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const endTime = endDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          
                          // If same day, show "3 Nov, 12:40 am - 03:40 am"
                          // If different days, show "3 Nov, 12:40 am - 4 Nov, 03:40 am"
                          return startDateStr === endDateStr 
                            ? `${startDateStr}, ${startTime} - ${endTime}`
                            : `${startDateStr}, ${startTime} - ${endDateStr}, ${endTime}`;
                        })()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-white font-semibold">
                        ₹{event.regFees}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-slate-300 text-xs">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          event.isTeamEvent
                            ? 'bg-purple-600/30 text-purple-100'
                            : 'bg-amber-600/30 text-amber-100'
                        }`}>
                          {event.isTeamEvent ? '👥 Team' : '👤 Individual'}
                        </span>
                        <div className="text-xs mt-1 text-slate-400">
                          {event.minTeamMembers}-{event.maxTeamMembers} members
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {canManageDiscounts(adminUser?.accesslevel || 0) && (
                            <button
                              onClick={() => handleCreateDiscount(event)}
                              className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 active:scale-95 border border-green-400/30"
                              title="Create Discount"
                            >
                              <Percent size={16} />
                            </button>
                          )}
                          {(canEditEvent(adminUser?.accesslevel || 3) && canEditEventByAdmin(event, adminUser)) && (
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95 border border-blue-400/30"
                              title="Edit Event"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {(canDeleteEvent(adminUser?.accesslevel || 3) && canDeleteEventByAdmin(event, adminUser)) && (
                            <button
                              onClick={() => handleDelete(event)}
                              className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 border border-red-400/30"
                              title="Delete Event"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setShowEditModal(false)}
          onUpdate={onEventUpdated}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingEvent && (
        <DeleteEventModal
          event={deletingEvent}
          onClose={() => setShowDeleteModal(false)}
          onDelete={onEventDeleted}
        />
      )}

      {/* Create Discount Modal */}
      {showDiscountModal && selectedEventForDiscount && (
        <CreateDiscountModal
          event={selectedEventForDiscount}
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          onSuccess={() => {
            setShowDiscountModal(false);
            setSelectedEventForDiscount(null);
          }}
        />
      )}
    </div>
  );
}
