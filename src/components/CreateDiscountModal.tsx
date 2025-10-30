'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface Event {
  _id?: string;
  eventId: string;
  eventName: string;
  regFees: number;
}

interface CreateDiscountModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateDiscountModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: CreateDiscountModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const handleClose = () => {
    setUserEmail('');
    setDiscountAmount('');
    setError('');
    setSuccess(false);
    setGeneratedCode('');
    setCodeCopied(false);
    onClose();
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setGeneratedCode('');

    if (!userEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!discountAmount || isNaN(Number(discountAmount)) || Number(discountAmount) <= 0) {
      setError('Please enter a valid discount amount');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Admin session expired. Please login again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: userEmail.trim().toLowerCase(),
          eventId: event.eventId,
          eventName: event.eventName,
          discountAmount: Number(discountAmount),
        }),
      });

      console.log('Create discount request:', {
        userEmail: userEmail.trim().toLowerCase(),
        eventId: event.eventId,
        eventName: event.eventName,
        discountAmount: Number(discountAmount),
        type: typeof Number(discountAmount),
      });

      const data = await response.json();
      console.log('Create discount response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate discount code');
      }

      setGeneratedCode(data.discount.discountCode);
      setSuccess(true);
      setUserEmail('');
      setDiscountAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate discount code');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#2a0a56]/95 to-[#140655]/95 border border-purple-500/50 rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Create Discount</h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-purple-500/20 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Event Info */}
            <div className="mb-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">Event:</span> {event.eventName}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">Fees:</span> ₹{event.regFees}
              </p>
            </div>

            {!success ? (
              <form onSubmit={handleGenerateCode} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
                    disabled={isLoading}
                  />
                </div>

                {/* Discount Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="Enter discount amount in rupees"
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 items-start p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Discount Code'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Success Message */}
                <div className="flex gap-2 items-start p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">Discount code generated successfully!</p>
                </div>

                {/* Generated Code Display */}
                <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">DISCOUNT CODE</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {generatedCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition"
                      title="Copy code"
                    >
                      <Copy
                        size={18}
                        className={`transition ${
                          codeCopied ? 'text-green-400' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setGeneratedCode('');
                    }}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-white font-semibold rounded-lg transition"
                  >
                    Create Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
