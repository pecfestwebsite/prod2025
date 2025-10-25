'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface Event {
  _id: string;
  eventId: string;
  eventName: string;
  societyName: string;
}

interface DeleteEventModalProps {
  event: Event;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteEventModal({ event, onClose, onDelete }: DeleteEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) {
      setError('Please confirm deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/events/${event.eventId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setTimeout(() => {
          onDelete();
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete event');
      }
    } catch (err) {
      setError('Error deleting event. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <style>{`
        .delete-modal-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .delete-modal-scroll::-webkit-scrollbar-track {
          background: rgba(147, 51, 234, 0.2);
          border-radius: 10px;
        }
        .delete-modal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ef4444, #dc2626);
          border-radius: 10px;
        }
        .delete-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #f87171, #ef4444);
        }
      `}</style>
      <div className="bg-slate-900/50 rounded-3xl shadow-2xl border-2 border-red-500/50 max-w-md w-full relative max-h-[90vh] overflow-y-auto delete-modal-scroll">
        <div className="p-8">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-600/30 p-4 rounded-full">
              <AlertTriangle className="text-red-300" size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">⚠️ Delete Event?</h2>
          <p className="text-slate-400 text-center mb-6">This action cannot be undone!</p>

          {/* Event Details */}
          <div className="bg-red-900/20 rounded-lg p-4 mb-6 border border-red-600/30">
            <div className="space-y-2">
              <p className="text-white">
                <span className="font-semibold">Event:</span> {event.eventName}
              </p>
              <p className="text-white">
                <span className="font-semibold">Society:</span> {event.societyName}
              </p>
              <p className="text-slate-300 text-sm">
                <span className="font-semibold">Event ID:</span> {event.eventId}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 rounded accent-red-500"
                disabled={loading}
              />
              <span className="text-slate-300 text-sm">
                I understand this will permanently delete the event
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 bg-slate-800/50 text-slate-300 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/70 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !confirmed}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                confirmed && !loading
                  ? 'bg-gradient-to-r from-red-700 to-red-600 text-white border-red-800 hover:shadow-lg hover:shadow-red-500/30 cursor-pointer'
                  : 'bg-red-900/30 text-red-300/50 border-red-700/30 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-200/30 border-t-red-200 rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={20} />
                  Delete Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
