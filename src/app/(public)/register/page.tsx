"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './register.module.css'; // Import CSS module

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [branch, setBranch] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    
    const interval = setInterval(() => {
      setResendTimer(current => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.status === 429) {
        // Parse lockout time from error message if available
        const timeMatch = data.error.match(/(\d+)/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          if (data.error.includes('hours')) {
            setResendTimer(minutes * 60 * 60);
          } else if (data.error.includes('minutes')) {
            setResendTimer(minutes * 60);
          } else {
            setResendTimer(minutes);
          }
        } else {
          setResendTimer(60); // Default to 60 seconds if no time specified
        }
        setError(data.error);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('Code sent to your email! ✨');
      setStep('otp');
      setResendTimer(60); // Set 60 second cooldown
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
    setSuccess('');

    try {
      // First, verify the OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.status === 429) {
        // Rate limit or lockout response
        setError(verifyData.error);
        setIsResendBlocked(true);
        return;
      }
      
      if (!verifyResponse.ok) {
        // Handle remaining attempts message
        setError(verifyData.error || 'Invalid OTP');
        return;
      }

      // Store JWT token in localStorage
      if (verifyData.token) {
        localStorage.setItem('token', verifyData.token);
        const event = new Event('tokenChanged');
        window.dispatchEvent(event);
      }

      // OTP is valid - check if this is an existing user or new registration
      // The verify-otp endpoint creates/updates the user, so check the response
      const userData = verifyData.user;
      
      // If user has complete profile data, they're an existing user
      if (userData.name && userData.college && userData.studentId && userData.phoneNumber && userData.branch) {
        setUserExists(true);
        setSuccess('Login successful! Redirecting...');
        // Redirect to home page after a brief delay
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        // New user - need to complete registration
        setUserExists(false);
        setSuccess('Email verified! Please complete your registration.');
        setStep('details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Indian phone number validation (10 digits, optionally with +91 prefix)
    const phoneRegex = /^(\+91[\s-]?)?[0]?[6789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateStudentId = (id: string) => {
    // At least 5 characters, alphanumeric
    return id.length >= 5 && /^[a-zA-Z0-9]+$/.test(id);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate fields
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Indian phone number');
      setLoading(false);
      return;
    }

    if (!validateStudentId(studentId)) {
      setError('Student ID must be at least 5 characters long and contain only letters and numbers');
      setLoading(false);
      return;
    }

    if (name.length < 3) {
      setError('Name must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (college.length < 3) {
      setError('Please enter a valid college name');
      setLoading(false);
      return;
    }

    if (branch.length < 2) {
      setError('Please enter a valid branch name');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      // Update user profile with the missing fields
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          email, 
          name, 
          college, 
          studentId, 
          phoneNumber, 
          referralCode, 
          branch 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      await refreshAuth();

      setSuccess('Registration successful! Redirecting...');
      // Redirect to home page after a brief delay
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to home if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#140655' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
                      className={`${styles.inputField} w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-12 text-base sm:text-lg rounded-xl px-4 outline-none transition-all`}
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
            ) : step === 'otp' ? (
              <div className="space-y-6">
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
                      autoFocus
                      className="w-full border-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 h-14 text-center text-2xl tracking-widest font-bold rounded-xl outline-none transition-all"
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
                          Verifying...
                        </span>
                      ) : (
                        '🔓 Verify Code'
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

                <div className="mt-6 text-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || resendTimer > 0}
                    className={`text-sm transition-colors ${
                      resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-blue-300 hover:text-blue-200'
                    }`}
                  >
                    {resendTimer > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-5 text-center">⏳</span>
                        Resend in {formatTime(resendTimer)}
                      </span>
                    ) : (
                      "Didn't receive code? Resend"
                    )}
                  </button>
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg h-12 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Completing Registration...
                      </span>
                    ) : (
                      '🌙 Complete Registration'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setName('');
                      setCollege('');
                      setStudentId('');
                      setPhoneNumber('');
                      setReferralCode('');
                      setBranch('');
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full text-slate-300 hover:text-white hover:bg-purple-600/20 py-2 rounded-xl transition-all border-2 border-transparent hover:border-purple-400/30"
                  >
                    ← Start Over
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">Already registered?</p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors inline-flex items-center gap-1"
            >
              Go to Home <span>→</span>
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

function setIsResendBlocked(arg0: boolean) {
  throw new Error('Function not implemented.');
}
