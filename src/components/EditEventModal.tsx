'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface Event {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  contactInfo: string;
  teamLimit: number;
  team: number;
}

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditEventModal({ event, onClose, onUpdate }: EditEventModalProps) {
  const [formData, setFormData] = useState<Event>(event);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'regFees' || name === 'teamLimit' || name === 'team' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${event.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onUpdate();
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update event');
      }
    } catch (err) {
      setError('Error updating event. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-emerald-900 to-green-900 rounded-3xl p-8 border-2 border-emerald-500/50 shadow-2xl text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-600/30 p-4 rounded-full">
              <Check className="text-emerald-300" size={32} />
            </div>
          </div>
          <p className="text-white font-bold text-lg">✨ Event Updated! ✨</p>
          <p className="text-emerald-300/70 text-sm mt-2">Changes saved successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
      <style>{`
        .edit-modal-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .edit-modal-scroll::-webkit-scrollbar-track {
          background: rgba(147, 51, 234, 0.2);
          border-radius: 10px;
        }
        .edit-modal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #9333ea);
          border-radius: 10px;
        }
        .edit-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #c084fc, #a855f7);
        }
      `}</style>
      <div className="bg-slate-900/50 rounded-3xl shadow-2xl border-2 border-slate-400/25 max-w-2xl w-full my-8 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 sm:p-8 flex flex-col overflow-hidden flex-1">
          <h2 className="text-2xl font-bold text-white mb-6 flex-shrink-0" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
            ✏️ Edit Event
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 flex-shrink-0">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 edit-modal-scroll pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Event Name</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white transition-all"
                >
                  <option value="technical" className="text-slate-900">Technical</option>
                  <option value="cultural" className="text-slate-900">Cultural</option>
                  <option value="convenor" className="text-slate-900">Convenor</option>
                </select>
              </div>

              {/* Society Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Society Name</label>
                <input
                  type="text"
                  name="societyName"
                  value={formData.societyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* Registration Fees */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Registration Fees (₹)</label>
                <input
                  type="number"
                  name="regFees"
                  value={formData.regFees}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={new Date(formData.dateTime).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateTime: new Date(e.target.value).toISOString() }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* Team Limit */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Team Limit</label>
                <input
                  type="number"
                  name="teamLimit"
                  value={formData.teamLimit}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
              />
            </div>

            {/* PDF Link */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">PDF Link</label>
              <input
                type="url"
                name="pdfLink"
                value={formData.pdfLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
              />
            </div>

            {/* Brief Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Brief Description</label>
              <textarea
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all resize-none"
              />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-slate-400/20 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 bg-slate-800/50 text-slate-300 border-slate-700/50 hover:border-purple-500 hover:bg-slate-800/70 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Update Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
