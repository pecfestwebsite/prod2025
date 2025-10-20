"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${(i * 7.3) % 100}%`,
              left: `${(i * 11.7) % 100}%`,
              animationDelay: `${(i * 0.1) % 3}s`,
              animationDuration: `${2 + (i * 0.05) % 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl animate-bounce opacity-40"
            style={{
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? '5%' : '90%',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            🏮
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-2">
            <div className="text-7xl mb-4 animate-bounce">🌙</div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 drop-shadow-lg">
              PECFEST 2025
            </h1>
            <p className="text-2xl text-purple-200 font-light tracking-wide">
              PECFEST 2025
            </p>
            <p className="text-sm text-purple-300 mt-4">✨ Register to Enter ✨</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/10 border-2 border-purple-400/30 shadow-2xl p-8">
            {step === 'email' ? (
              <div className="space-y-6">
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-lg">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/20 border-purple-300/50 text-white placeholder:text-purple-200/50 focus:border-yellow-400 focus:ring-yellow-400/50 h-12 text-lg"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-lg text-sm">{success}</div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-purple-900 font-bold text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="animate-spin">⏳</span>Sending...</span>
                    ) : (
                      '🔮 Send Code'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-white">College</Label>
                    <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} required className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-white">Student ID</Label>
                    <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-white">Branch</Label>
                    <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} required className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                    <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-white">Referral Code (optional)</Label>
                    <Input id="referralCode" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="bg-white/20 border-purple-300/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-white">Enter Code</Label>
                    <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} placeholder="000000" className="bg-white/20 border-purple-300/50 text-white text-center tracking-widest" />
                    <p className="text-sm text-purple-300">Code sent to {email}</p>
                  </div>
                </div>

                {error && (<div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>)}
                {success && (<div className="bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-lg text-sm">{success}</div>)}

                <div className="space-y-3">
                  <Button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-purple-900 font-bold text-lg h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                    {loading ? (<span className="flex items-center gap-2"><span className="animate-spin">⏳</span>Registering...</span>) : ('✨ Register Now')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setStep('email'); setOtp(''); setError(''); setSuccess(''); }} className="w-full text-purple-200 hover:text-white hover:bg-white/10">← Use Different Email</Button>
                </div>
              </form>
            )}
          </Card>

          <div className="mt-8 text-center space-y-2">
            <p className="text-purple-300 text-sm">Already registered?</p>
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-yellow-300">Go to Login →</Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-950 to-transparent pointer-events-none" />
    </div>
  );
}


