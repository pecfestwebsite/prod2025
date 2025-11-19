"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth0 } from '@auth0/auth0-react';

export default function LoginPage() {
  const router = useRouter();
  // const { loginWithRedirect } = useAuth0();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Commented out for now
  // const handleGoogleLogin = async () => {
  //   try {
  //     await loginWithRedirect({
  //       authorizationParams: {
  //         connection: 'google-oauth2',
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Google login failed:', error);
  //   }
  // };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Trigger token change event for navbar to update
        window.dispatchEvent(new Event('tokenChanged'));
      }

      setSuccess('Welcome! 🌙');
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/14.png" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-purple-900/50" />
      </div>



      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              PECFEST 2025
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-2">
              ✧ Enter the Portal ✧
            </p>
            <p className="text-slate-400 text-sm">
              A journey through time
            </p>
          </div>

          {/* Login Card */}
          <div 
            className="rounded-2xl p-6 sm:p-8 border-2 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
            style={{
              backgroundColor: '#0f0444',
              borderColor: '#4321a9',
            }}
          >
            {step === 'email' ? (
              <div className="space-y-6">
                {/* Email OTP Form */}
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-white text-base sm:text-lg font-medium">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-12 text-base sm:text-lg rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                      ⚠ {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-900/30 border-2 border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm">
                      ✓ {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg h-12 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Sending...
                      </span>
                    ) : (
                      '✨ Send Magic Code'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    🔮 A secure code will be sent to your email
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-white text-base sm:text-lg font-medium">
                    Enter Magic Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-14 text-center text-2xl tracking-widest font-bold rounded-xl outline-none transition-all"
                    style={{
                      backgroundColor: '#1a0a4e',
                      borderColor: '#4321a9',
                    }}
                    disabled={loading}
                  />
                  <p className="text-sm text-slate-400 text-center mt-2">
                    Code sent to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                    ⚠ {error}
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-900/30 border-2 border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm">
                    ✓ {success}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg h-12 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Unlocking Portal...
                      </span>
                    ) : (
                      '🌙 Enter Portal'
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
                    className="w-full text-slate-300 hover:text-white hover:bg-purple-600/20 py-2 rounded-xl transition-all border-2 border-transparent hover:border-purple-400/30"
                  >
                    ← Use Different Email
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
              <span className="filter brightness-0 invert">🏮</span>
              A journey through time
              <span className="filter brightness-0 invert">🏮</span>
            </p>
            <p className="text-slate-500 text-xs">
              Witness greatness at PECFEST 2025
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
