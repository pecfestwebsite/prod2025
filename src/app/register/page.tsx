"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [branch, setBranch] = useState('');
  const [step, setStep] = useState<'email' | 'details'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, name, college, studentId, phoneNumber, referralCode, branch }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setError('Email already registered. Please login instead.');
          return;
        }
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Starlight background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-orange-600 rounded-full blur-3xl opacity-80"></div>
      </div>

      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${(i * 7.3) % 100}%`,
              left: `${(i * 11.7) % 100}%`,
              animationDelay: `${(i * 0.1) % 3}s`,
              animationDuration: `${2 + (i * 0.05) % 3}s`,
              opacity: 0.6,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl sm:text-6xl filter brightness-0 invert animate-bounce">🌙</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              PECFEST 2025
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-2">
              ✧ Register to Enter ✧
            </p>
            <p className="text-slate-400 text-sm">
              Join the mystical journey
            </p>
          </div>

          {/* Register Card */}
          <div 
            className="rounded-2xl p-6 sm:p-8 border-2 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
            style={{
              backgroundColor: '#0f0444',
              borderColor: '#4321a9',
            }}
          >
            {step === 'email' ? (
              <div className="space-y-6">
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
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-white text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="college" className="block text-white text-sm font-medium">
                      College
                    </label>
                    <input
                      id="college"
                      type="text"
                      placeholder="Your College Name"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="studentId" className="block text-white text-sm font-medium">
                      Student ID
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      placeholder="12345678"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="branch" className="block text-white text-sm font-medium">
                      Branch
                    </label>
                    <input
                      id="branch"
                      type="text"
                      placeholder="Computer Science"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-white text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="referralCode" className="block text-white text-sm font-medium">
                      Referral Code <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="referralCode"
                      type="text"
                      placeholder="FEST2025"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-base rounded-xl px-4 outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp" className="block text-white text-sm font-medium">
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
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-11 text-center text-xl tracking-widest font-bold rounded-xl outline-none transition-all"
                      style={{
                        backgroundColor: '#1a0a4e',
                        borderColor: '#4321a9',
                      }}
                      disabled={loading}
                    />
                    <p className="text-xs text-slate-400 text-center">
                      Code sent to <span className="text-white font-medium">{email}</span>
                    </p>
                  </div>
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

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg h-12 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Registering...
                      </span>
                    ) : (
                      '🌙 Register Now'
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
          <div className="mt-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">Already registered?</p>
            <button
              onClick={() => router.push('/login')}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors inline-flex items-center gap-1"
            >
              Go to Login <span>→</span>
            </button>
          </div>

          {/* Bottom decoration */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
              <span className="filter brightness-0 invert">🏮</span>
              Join the celebration
              <span className="filter brightness-0 invert">🏮</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}