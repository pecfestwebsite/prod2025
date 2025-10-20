'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginErrors {
  [key: string]: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        
        // Store admin information in localStorage
        localStorage.setItem('adminUser', JSON.stringify({
          id: data.admin.id,
          userId: data.admin.userId,
          email: data.admin.email,
          name: data.admin.name,
          accesslevel: data.admin.accesslevel,
          clubsoc: data.admin.clubsoc,
          verified: data.admin.verified,
        }));
        
        // Also set cookie for middleware validation (24 hours)
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        
        // Dispatch custom event to notify navbar of login
        window.dispatchEvent(new Event('adminUserChanged'));
        
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting to dashboard...',
        });
        
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        const data = await response.json();
        setMessage({
          type: 'error',
          text: data.error || 'Invalid email or password',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
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
        <div className="absolute bottom-20 right-20 text-white text-lg animate-pulse filter brightness-0 invert">✦</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">🌙</span>
            <h1 className="text-4xl sm:text-7xl font-bold drop-shadow-lg text-white" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              PECFEST
            </h1>
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">✨</span>
          </div>
          <p className="text-slate-300 text-sm sm:text-base font-semibold drop-shadow italic">
            ✧ Admin Portal Login ✧
          </p>
          <p className="text-slate-400/70 text-xs sm:text-sm mt-2">
            Enter your mystical credentials to access the realm
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-slate-400/25 backdrop-blur-md relative" style={{ backgroundColor: '#0f0444' }}>
          {/* Ornamental corners */}
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-slate-300 rounded-br-xl"></div>
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-slate-300 rounded-bl-xl"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-slate-300 rounded-tr-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-slate-300 rounded-tl-xl"></div>

          {/* Ornamental top border */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300 rounded-full"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Messages */}
            {message.text && (
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 border-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-600/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-red-600/20 border-red-400/50 text-red-200'
                }`}
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Mail size={18} />
                Email Address
              </label>
              <div className="relative" style={{
                background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
                borderRadius: '0.75rem',
                padding: errors.email ? '0' : '2px',
              }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@pecfest.com"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-[calc(0.75rem-2px)] focus:outline-none transition-all font-medium text-slate-100 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email
                      ? 'border-2 border-red-500 bg-red-900/30 focus:border-red-400'
                      : 'bg-blue-900/40 border-0'
                  }`}
                />
                {errors.email && (
                  <AlertCircle
                    className="absolute right-3 top-3.5 text-red-400"
                    size={20}
                  />
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle size={16} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Lock size={18} />
                Email Verification
              </label>
              <p className="text-xs text-slate-400 bg-blue-900/20 rounded-lg p-3 border border-slate-400/20">
                Enter your admin email registered in the system. We'll verify your admin status and log you in.
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:scale-105 transform border-2 border-purple-500/50 shadow-lg shadow-purple-500/40 hover:shadow-purple-400/50"
              style={{
                background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  ✨ Enter the Mystical Realm ✨
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-400/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-400/60" style={{ backgroundColor: 'rgba(21, 14, 92, 0.7)' }}>
                  How It Works
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-900/20 rounded-xl p-4 border border-slate-400/20 text-center">
              <p className="text-xs text-slate-300/70 mb-3 font-medium">Enter your admin email to login:</p>
              <p className="text-xs text-slate-200 font-semibold bg-blue-900/40 rounded-lg p-2 border border-blue-500/20">
                Your email must be registered in our admin database
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-slate-400/60 text-xs sm:text-sm">
            ✦ Protected by mystical enchantments ✦
          </p>
        </div>
      </div>
    </div>
  );
}
