'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const response = await fetch('/api/auth/send-otp-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('Code sent to your email! ✨');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

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
      
      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new Event('adminUserChanged'));

      // Show loading component and refresh page
      setIsVerifying(true);
      
      // Refresh the page first
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Loading Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(20, 6, 85, 0.95)' }}>
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-slate-400/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Entering the Realm...
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Preparing your dashboard
            </p>
          </div>
        </div>
      )}

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

          <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-6 relative z-10">
            {/* Messages */}
            {error && (
              <div className="p-4 rounded-2xl flex items-start gap-3 border-2 bg-red-600/20 border-red-400/50 text-red-200">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl flex items-start gap-3 border-2 bg-emerald-600/20 border-emerald-400/50 text-emerald-200">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                    <Mail size={18} />
                    Admin Email Address
                  </label>
                  <div className="relative" style={{
                    background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
                    borderRadius: '0.75rem',
                    padding: '2px',
                  }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="admin@pecfest.com"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-[calc(0.75rem-2px)] focus:outline-none transition-all font-medium text-slate-100 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-900/40 border-0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:scale-105 transform border-2 border-purple-500/50 shadow-lg shadow-purple-500/40 hover:shadow-purple-400/50"
                  style={{
                    background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      📧 Send Verification Code
                    </>
                  )}
                </button>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                    ✨ Verification Code
                  </label>
                  <p className="text-xs text-slate-400 bg-blue-900/20 rounded-lg p-3 border border-slate-400/20 mb-3">
                    Enter the 6-digit code sent to <span className="font-semibold text-slate-300">{email}</span>
                  </p>
                  <div className="relative" style={{
                    background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
                    borderRadius: '0.75rem',
                    padding: '2px',
                  }}>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                      placeholder="000000"
                      disabled={loading}
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-[calc(0.75rem-2px)] focus:outline-none transition-all font-bold text-center text-2xl letter-spacing text-slate-100 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-900/40 border-0 tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:scale-105 transform border-2 border-purple-500/50 shadow-lg shadow-purple-500/40 hover:shadow-purple-400/50"
                  style={{
                    background: 'linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1)',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      ✨ Enter the Mystical Realm ✨
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-slate-300 text-sm"
                >
                  ← Change Email
                </button>
              </>
            )}

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
              <p className="text-xs text-slate-300/70 mb-3 font-medium">
                {step === 'email' ? 'Enter your admin email to receive a verification code' : 'Verification code valid for 10 minutes'}
              </p>
              <p className="text-xs text-slate-200 font-semibold bg-blue-900/40 rounded-lg p-2 border border-blue-500/20">
                🔐 Your admin account is secure with OTP verification
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