'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getAdminUser, getLockedSocietyName } from '@/lib/accessControl';
import { uploadImageToFirebase } from '@/lib/firebaseStorage';
import Compressor from 'compressorjs';

const CLUBS_SOCS = [
  "None",
  //Clubs
  'Dramatics', 'SAASC', 'APC', 'ELC', 'Music',
  'HEB', 'PDC', 'PEB', 'Rotaract', 'SCC',
  'CIM', 'EIC', 'WEC', 'EEB', "NCC", "NSS", "Sports",

  //SOCS
  'Robotics', 'ACM', 'ATS', 'ASME', 'ASCE',
  'ASPS', 'IEEE', 'IGS', 'IIM',
  'SESI', 'SAE', 'SME', "ES"
];

interface Event {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  additionalClub?: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  endDateTime?: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string;
  contactInfo?: string;
  isTeamEvent: boolean;
  minTeamMembers: number;
  maxTeamMembers: number;
}

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onUpdate: () => void;
}

// Helper function to format ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
const formatDateTimeForInput = (dateString: string): string => {
  if (!dateString) return '';
  // If it's already in the correct format, return it
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it's an ISO string, convert it
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
};

export default function EditEventModal({ event, onClose, onUpdate }: EditEventModalProps) {
  const [formData, setFormData] = useState<Event>({
    ...event,
    dateTime: formatDateTimeForInput(event.dateTime),
    endDateTime: event.endDateTime ? formatDateTimeForInput(event.endDateTime) : undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lockedSociety, setLockedSociety] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(event.image);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Check if society name should be locked for this admin
  useEffect(() => {
    const admin = getAdminUser();
    const locked = getLockedSocietyName(admin);
    setLockedSociety(locked);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'regFees' || name === 'minTeamMembers' || name === 'maxTeamMembers'
        ? parseFloat(value) || 0
        : name === 'isTeamEvent'
          ? e.target instanceof HTMLInputElement ? e.target.checked : value === 'true'
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1920,
        convertSize: 200000,
        success: (compressedResult) => {
          const compressedFile = new File([compressedResult], file.name, {
            type: compressedResult.type,
            lastModified: Date.now(),
          });

          if (compressedFile.size > 200000) {
            new Compressor(file, {
              quality: 0.4,
              maxWidth: 1600,
              maxHeight: 1600,
              convertSize: 200000,
              success: (secondCompressedResult) => {
                const finalFile = new File([secondCompressedResult], file.name, {
                  type: secondCompressedResult.type,
                  lastModified: Date.now(),
                });
                setImageFile(finalFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(finalFile);
              },
              error: (err) => {
                console.error('Compression error:', err);
                setError('Failed to compress image');
              },
            });
          } else {
            setImageFile(compressedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
          }
        },
        error: (err) => {
          console.error('Compression error:', err);
          setError('Failed to compress image');
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImageToFirebase(
            imageFile,
            'events',
            `event_${formData.eventName}_${Date.now()}`
          );
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const updatedFormData = {
        ...formData,
        image: imageUrl,
      };

      const response = await fetch(`/api/events/${event.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
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
                <label className="block text-sm font-semibold text-white mb-2">
                  Society Name {lockedSociety && <span className="text-xs text-slate-400">(Locked)</span>}
                </label>
                <select
                  name="societyName"
                  value={formData.societyName}
                  onChange={handleInputChange}
                  disabled={!!lockedSociety}
                  className={`w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none transition-all ${lockedSociety
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-blue-900/40 text-white'
                    }`}
                >
                  <option value="" className="text-slate-900">Select a Society/Club</option>
                  {CLUBS_SOCS.filter(club => club !== 'None').map((club) => (
                    <option key={club} value={club} className="text-slate-900">{club}</option>
                  ))}
                </select>
                {formData.additionalClub && formData.additionalClub !== 'None' && (
                  <div className="mt-2 p-2 bg-purple-900/30 border border-purple-500/30 rounded text-xs text-purple-200 flex items-center gap-1.5">
                    <span className="text-purple-400">+</span>
                    <span>{formData.additionalClub}</span>
                  </div>
                )}
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

              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateTime: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">End Date & Time <span className="text-slate-400 text-xs">(Optional - defaults to 1 hour after start time)</span></label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime || ''}
                  onChange={(e) => {
                    if (e.target.value > formData.dateTime) {
                      setFormData((prev) => ({ ...prev, endDateTime: e.target.value }));
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white placeholder-slate-400 transition-all"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Event Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isTeamEvent"
                      checked={!formData.isTeamEvent}
                      onChange={() => setFormData((prev) => ({
                        ...prev,
                        isTeamEvent: false,
                        minTeamMembers: 1,
                        maxTeamMembers: 1
                      }))}
                      className="w-4 h-4"
                    />
                    <span className="text-white">👤 Individual</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isTeamEvent"
                      checked={formData.isTeamEvent}
                      onChange={() => setFormData((prev) => ({
                        ...prev,
                        isTeamEvent: true
                      }))}
                      className="w-4 h-4"
                    />
                    <span className="text-white">👥 Team</span>
                  </label>
                </div>
              </div>

              {/* Min Team Members */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Min Team Members {!formData.isTeamEvent && <span className="text-xs text-slate-400">(Locked)</span>}
                </label>
                <input
                  type="number"
                  name="minTeamMembers"
                  value={formData.minTeamMembers}
                  onChange={handleInputChange}
                  disabled={!formData.isTeamEvent}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none transition-all ${!formData.isTeamEvent
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-blue-900/40 text-white'
                    }`}
                />
              </div>

              {/* Max Team Members */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Max Team Members {!formData.isTeamEvent && <span className="text-xs text-slate-400">(Locked)</span>}
                </label>
                <input
                  type="number"
                  name="maxTeamMembers"
                  value={formData.maxTeamMembers}
                  onChange={handleInputChange}
                  disabled={!formData.isTeamEvent}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none transition-all ${!formData.isTeamEvent
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-blue-900/40 text-white'
                    }`}
                />
              </div>

              {/* Additional Club */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Additional Club (Optional)</label>
                <select
                  name="additionalClub"
                  value={formData.additionalClub || 'None'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/50 focus:border-purple-500 focus:outline-none bg-blue-900/40 text-white transition-all"
                >
                  {CLUBS_SOCS.filter(club => club !== formData.societyName).map((club) => (
                    <option key={club} value={club} className="text-slate-900">{club}</option>
                  ))}
                </select>
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
              <label className="block text-sm font-semibold text-white mb-2">Contact Info <span className="text-slate-400 text-xs">(Phone or Email - Optional)</span></label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo || ''}
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

              {/* Event Image */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Event Image</label>
                <div className="border-4 border-dashed border-purple-500/50 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-900/30 transition-all cursor-pointer bg-purple-900/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="editImageInput"
                  />
                  <label htmlFor="editImageInput" className="cursor-pointer block">
                    {imagePreview && imagePreview !== event.image ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg border-2 border-purple-500/50"
                        />
                        <p className="text-xs text-slate-300 font-semibold">Click to change image</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Current"
                          className="max-h-32 mx-auto rounded-lg border-2 border-purple-500/50"
                        />
                        <p className="text-xs text-slate-300 font-semibold">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-2xl">🖼️</p>
                        <p className="text-xs text-slate-300 font-semibold">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
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
