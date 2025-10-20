'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { getAdminUser, getLockedSocietyName } from '@/lib/accessControl';

interface FormData {
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string;
  mapCoordinates: {
    latitude: number | '';
    longitude: number | '';
  };
  contactInfo: string;
  team: number;
  teamLimit: number;
}

interface FormErrors {
  [key: string]: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

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

// List of clubs (before SOCS section in the array)
const CLUBS = [
  'Dramatics', 'SAASC', 'APC', 'ELC', 'Music',
  'HEB', 'PDC', 'PEB', 'Rotaract', 'SCC',
  'CIM', 'EIC', 'WEC', 'EEB', "NCC", "NSS", "Sports"
];

// List of societies (after SOCS section in the array)
const SOCS = [
  'Robotics', 'ACM', 'ATS', 'ASME', 'ASCE',
  'ASPS', 'IEEE', 'IGS', 'IIM',
  'SESI', 'SAE', 'SME', "ES"
];

// Helper function to determine category based on club/society selection
const getCategoryFromClubSoc = (clubsoc: string): 'technical' | 'cultural' | 'convenor' => {
  if (!clubsoc || clubsoc === 'None') return 'convenor';
  if (CLUBS.includes(clubsoc)) return 'cultural';
  if (SOCS.includes(clubsoc)) return 'technical';
  return 'convenor';
};

const steps = [
  { id: 1, title: 'Basic Info', description: 'Club/Society & Category' },
  { id: 2, title: 'Event Details', description: 'Name & Date' },
  { id: 3, title: 'Registration', description: 'Fees & Team Settings' },
  { id: 4, title: 'Location', description: 'Address & Coordinates' },
  { id: 5, title: 'Media', description: 'Image & PDF' },
  { id: 6, title: 'Review', description: 'Summary & Confirm' },
];

export default function AddEventsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: 'technical',
    societyName: '',
    eventName: '',
    regFees: 0,
    dateTime: '',
    location: '',
    briefDescription: '',
    pdfLink: '',
    image: '',
    mapCoordinates: { latitude: '', longitude: '' },
    contactInfo: '',
    team: 0,
    teamLimit: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load admin user on mount and set locked society name if needed
  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
    
    // If user is level 2, lock their society name
    const lockedSociety = getLockedSocietyName(admin);
    if (lockedSociety) {
      setFormData(prev => ({
        ...prev,
        societyName: lockedSociety,
        category: getCategoryFromClubSoc(lockedSociety)
      }));
    }
  }, []);

  // Auto-update category when societyName changes
  useEffect(() => {
    if (formData.societyName) {
      const newCategory = getCategoryFromClubSoc(formData.societyName);
      setFormData(prev => ({
        ...prev,
        category: newCategory
      }));
    }
  }, [formData.societyName]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
        break;
      case 2:
        if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
        if (!formData.societyName.trim()) newErrors.societyName = 'Society name is required';
        break;
      case 3:
        if (formData.regFees < 0) newErrors.regFees = 'Registration fees cannot be negative';
        if (formData.teamLimit < 0) newErrors.teamLimit = 'Team limit cannot be negative';
        break;
      case 4:
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 5:
        if (!formData.image) newErrors.image = 'Image is required';
        if (!formData.pdfLink.trim()) newErrors.pdfLink = 'PDF link is required';
        break;
      case 6:
        if (!formData.briefDescription.trim())
          newErrors.briefDescription = 'Brief description is required';
        if (!formData.contactInfo.trim())
          newErrors.contactInfo = 'Contact info is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('mapCoordinates')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        mapCoordinates: {
          ...prev.mapCoordinates,
          [field]: value ? parseFloat(value) : '',
        },
      }));
    } else if (name === 'regFees' || name === 'team' || name === 'teamLimit') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (validateStep(6)) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitted(true);
          setTimeout(() => {
            setCurrentStep(1);
            setFormData({
              category: 'technical',
              societyName: '',
              eventName: '',
              regFees: 0,
              dateTime: '',
              location: '',
              briefDescription: '',
              pdfLink: '',
              image: '',
              mapCoordinates: { latitude: '', longitude: '' },
              contactInfo: '',
              team: 0,
              teamLimit: 0,
            });
            setImagePreview('');
            setSubmitted(false);
            setIsLoading(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setIsLoading(false);
      }
    }
  };

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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 flex-wrap">
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">🌙</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Add New Event
            </h1>
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">✨</span>
          </div>
          <p className="text-slate-300 text-sm sm:text-base font-semibold drop-shadow italic">
            ✧ Create and configure your mystical event in easy steps ✧
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-emerald-300 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Check className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg">✨ Success! ✨</p>
                <p className="text-sm text-emerald-100 font-medium mt-1">Event created successfully in the mystical realm</p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  category: 'technical',
                  societyName: '',
                  eventName: '',
                  regFees: 0,
                  dateTime: '',
                  location: '',
                  briefDescription: '',
                  pdfLink: '',
                  image: '',
                  mapCoordinates: { latitude: '', longitude: '' },
                  contactInfo: '',
                  team: 0,
                  teamLimit: 0,
                });
                setImagePreview('');
                setSubmitted(false);
              }}
              className="mt-4 w-full px-6 py-2 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-all duration-300 hover:scale-105"
            >
              ➕ Add More Events
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg backdrop-blur-sm">
            <div className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-3xl p-8 border-2 border-amber-400/50 shadow-2xl text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-amber-200 font-bold text-lg">Creating your mystical event...</p>
              <p className="text-amber-300/70 text-sm mt-2">✨ Please wait ✨</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center gap-1 sm:gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300 border-2 ${
                      step.id === currentStep
                        ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/50 scale-110'
                        : step.id < currentStep
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black border-emerald-600 shadow-lg shadow-emerald-500/30'
                          : 'bg-purple-900/50 text-slate-300 border-purple-600'
                    }`}
                  >
                    {step.id < currentStep ? <Check size={16} /> : step.id}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-2 text-center hidden sm:block">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400/70 mt-1 text-center hidden sm:block">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 sm:h-2 mx-1 rounded transition-all duration-300 ${
                      step.id < currentStep
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                        : 'bg-slate-700/50'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-slate-400/25 backdrop-blur-md relative" style={{ backgroundColor: '#0f0444' }}>
          {/* Ornamental corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-300 rounded-br-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-slate-300 rounded-bl-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-slate-300 rounded-tr-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-slate-300 rounded-tl-xl"></div>
          
          {/* Ornamental top border */}
          <div className="absolute top-0 left-12 right-12 h-1 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300 rounded-full"></div>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">🎭</span> Club/Society & Category
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Club/Society <span className="text-red-400">*</span>
                  {adminUser?.accesslevel === 1 && (
                    <span className="text-xs text-slate-400 ml-2">(Auto-filled for your club)</span>
                  )}
                </label>
                {adminUser?.accesslevel === 2 || adminUser?.accesslevel === 3 ? (
                  <select
                    name="societyName"
                    value={formData.societyName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-purple-900/50 ${
                      errors.societyName
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-purple-500/50 focus:border-slate-300 hover:border-slate-300'
                    } text-slate-100`}
                  >
                    <option value="">Select a club/society</option>
                    {CLUBS_SOCS.map((club) => (
                      <option key={club} value={club} className="bg-slate-900">
                        {club}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="societyName"
                    value={formData.societyName}
                    onChange={handleInputChange}
                    readOnly={adminUser?.accesslevel === 1}
                    disabled={adminUser?.accesslevel === 1}
                    placeholder="Enter society name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium ${
                      adminUser?.accesslevel === 1
                        ? 'bg-slate-700/50 border-slate-600 text-slate-300 cursor-not-allowed opacity-75'
                        : `bg-purple-900/50 ${
                            errors.societyName
                              ? 'border-red-500 bg-red-900/30'
                              : 'border-purple-500/50 focus:border-slate-300 hover:border-slate-300'
                          } text-slate-100 placeholder-purple-300`
                    }`}
                  />
                )}
                {errors.societyName && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.societyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Category <span className="text-red-400">*</span>
                  {formData.societyName && formData.societyName !== 'None' && (
                    <span className="text-xs text-slate-400 ml-2">(Auto-set based on club/society)</span>
                  )}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={!!(formData.societyName && formData.societyName !== 'None')}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium ${
                    formData.societyName && formData.societyName !== 'None'
                      ? 'bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed opacity-75'
                      : 'border-purple-500/50 bg-blue-900/40 text-slate-100 focus:border-slate-300 hover:border-slate-300'
                  }`}
                >
                  <option value="technical">⚙️ Technical</option>
                  <option value="cultural">🎨 Cultural</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Contact Info <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="Phone or Email"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-blue-900/40 ${
                    errors.contactInfo
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-purple-500/50 focus:border-slate-300 hover:border-slate-300'
                  } text-slate-100 placeholder-slate-500`}
                />
                {errors.contactInfo && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.contactInfo}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">📜</span> Event Details
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Event Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-blue-900/40 ${
                    errors.eventName
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                  } text-amber-100 placeholder-purple-300`}
                />
                {errors.eventName && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.eventName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-amber-400/50 rounded-xl focus:outline-none focus:border-amber-400 hover:border-amber-400 transition-all bg-purple-900/50 font-medium text-amber-100"
                />
              </div>
            </div>
          )}

          {/* Step 3: Registration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">💰</span> Registration & Team
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Registration Fees (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="regFees"
                  value={formData.regFees}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-purple-900/50 ${
                    errors.regFees
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                  } text-amber-100 placeholder-purple-300`}
                />
                {errors.regFees && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.regFees}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Team Size (default)
                  </label>
                  <input
                    type="number"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-amber-400/50 rounded-xl focus:outline-none focus:border-amber-400 hover:border-amber-400 transition-all bg-purple-900/50 font-medium text-amber-100 placeholder-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Team Limit <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="teamLimit"
                    value={formData.teamLimit}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-purple-900/50 ${
                      errors.teamLimit
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                    } text-amber-100 placeholder-purple-300`}
                  />
                  {errors.teamLimit && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={16} /> {errors.teamLimit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">📍</span> Event Location
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Auditorium, Building A"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-purple-900/50 ${
                    errors.location
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                  } text-amber-100 placeholder-purple-300`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.location}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🗺️</span> Map Coordinates (Optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white font-semibold mb-1">Latitude</label>
                    <input
                      type="number"
                      name="mapCoordinates.latitude"
                      value={formData.mapCoordinates.latitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 28.5355"
                      step="0.0001"
                      className="w-full px-4 py-3 border-2 border-amber-400/50 rounded-xl focus:outline-none focus:border-amber-400 hover:border-amber-400 transition-all bg-purple-900/50 font-medium text-amber-100 placeholder-purple-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white font-semibold mb-1">Longitude</label>
                    <input
                      type="number"
                      name="mapCoordinates.longitude"
                      value={formData.mapCoordinates.longitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 77.1670"
                      step="0.0001"
                      className="w-full px-4 py-3 border-2 border-amber-400/50 rounded-xl focus:outline-none focus:border-amber-400 hover:border-amber-400 transition-all bg-purple-900/50 font-medium text-amber-100 placeholder-purple-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">🖼️</span> Media & Links
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Event Image <span className="text-red-400">*</span>
                </label>
                <div className="border-4 border-dashed border-amber-400/50 rounded-2xl p-8 text-center hover:border-amber-400 hover:bg-purple-900/30 transition-all cursor-pointer bg-purple-900/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-xl border-2 border-amber-400/50"
                        />
                        <p className="text-sm text-amber-300 font-semibold">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-4xl">🎞️</p>
                        <p className="text-sm text-amber-200 font-semibold">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-amber-300/70 font-medium">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.image && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.image}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  PDF Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="pdfLink"
                  value={formData.pdfLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/event.pdf"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-medium bg-purple-900/50 ${
                    errors.pdfLink
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                  } text-amber-100 placeholder-purple-300`}
                />
                {errors.pdfLink && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.pdfLink}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  <span className="text-2xl">✨</span> Summary & Description
                </h2>
                <p className="text-slate-300 text-sm font-semibold">Review your mystical event details before submitting</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Brief Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="briefDescription"
                  value={formData.briefDescription}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description of the event"
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none font-medium bg-purple-900/50 ${
                    errors.briefDescription
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400'
                  } text-amber-100 placeholder-purple-300`}
                />
                {errors.briefDescription && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={16} /> {errors.briefDescription}
                  </p>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-purple-900/50 rounded-2xl p-6 space-y-4 border-2 border-amber-400/30">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-2xl">📋</span> Event Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Category</p>
                    <p className="text-sm font-bold text-amber-100 mt-1 capitalize">
                      {formData.category}
                    </p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Event Name</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">{formData.eventName}</p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Society</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">{formData.societyName}</p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Registration Fees</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">₹{formData.regFees}</p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Team Limit</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">{formData.teamLimit}</p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 col-span-full border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Date & Time</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">
                      {new Date(formData.dateTime).toLocaleString() || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4 col-span-full border-2 border-amber-400/20">
                    <p className="text-xs text-amber-300/70 font-bold">Location</p>
                    <p className="text-sm font-bold text-amber-100 mt-1">{formData.location}</p>
                  </div>
                  {imagePreview && (
                    <div className="col-span-full">
                      <p className="text-xs text-amber-300/70 font-bold mb-2">Event Image</p>
                      <img
                        src={imagePreview}
                        alt="Event"
                        className="w-full max-h-48 rounded-xl object-cover border-2 border-amber-400/50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8 pt-8 border-t-2 border-amber-400/20">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
                currentStep === 1
                  ? 'bg-purple-900/30 text-amber-300/50 cursor-not-allowed border-purple-700/50'
                  : 'bg-purple-900/50 text-amber-300 border-purple-700/50 hover:border-amber-400 hover:bg-purple-900/70 hover:shadow-lg hover:shadow-amber-400/20 hover:scale-105'
              }`}
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex-1" />

            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
                  isLoading
                    ? 'bg-emerald-600/50 text-white cursor-not-allowed border-emerald-700/50'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Submit Event</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 border-2 border-amber-800"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
