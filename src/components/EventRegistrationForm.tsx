'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Users, IndianRupee, AlertCircle, CheckCircle, Loader2, Copy, Percent } from 'lucide-react';
import { IEvent } from '@/models/Event';
import Link from 'next/link';
import { uploadImageToFirebase } from '@/lib/firebaseStorage';
import Compressor from 'compressorjs';

interface RegistrationFormProps {
  event: IEvent;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EventRegistrationForm({ event, onClose, onSuccess }: RegistrationFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<'leader' | 'member'>('leader');
  const [teamId, setTeamId] = useState<string>('');
  const [generatedTeamId, setGeneratedTeamId] = useState<string>('');
  const [teamIdCopied, setTeamIdCopied] = useState(false);
  const [teamValidation, setTeamValidation] = useState<{
    valid: boolean;
    memberCount: number;
    hasLeader: boolean;
    isFull: boolean;
    canJoin: boolean;
    message: string;
  } | null>(null);
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    message: string;
    discountedPrice?: number;
  } | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [accommodationRequired, setAccommodationRequired] = useState(false);
  const [accommodationMembers, setAccommodationMembers] = useState<number>(0);
  const [accommodationError, setAccommodationError] = useState('');
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxTeamMembers = event.maxTeamMembers || 1;
  const isTeamEvent = event.isTeamEvent || false;

  // Calculate total amount with discount and accommodation
  const accommodationFees = accommodationRequired ? accommodationMembers * 1500 : 0;
  const priceAfterDiscount = appliedDiscount 
    ? Math.max(0, event.regFees - appliedDiscount.discountAmount) 
    : event.regFees;
  const totalAmount = priceAfterDiscount + accommodationFees;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to register for events');
          setIsCheckingAuth(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.user?.email && data.user?.userId) {
          setCurrentUser(data.user.email);
          setCurrentUserId(data.user.userId);
        } else {
          setError('You must be logged in to register for events');
        }
      } catch (err) {
        setError('Failed to verify authentication');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Check if user is already registered for this event
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!currentUser || !event.eventId) return;

      setIsCheckingRegistration(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(
          `/api/registrations?eventId=${event.eventId}&userId=${currentUser}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.registrations && data.registrations.length > 0) {
          // User is already registered
          setExistingRegistration(data.registrations[0]);
        }
      } catch (err) {
        console.error('Error checking existing registration:', err);
      } finally {
        setIsCheckingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [currentUser, event.eventId]);

  // Generate Team ID when user selects leader role
  useEffect(() => {
    if (isTeamEvent && userRole === 'leader' && !generatedTeamId) {
      const newTeamId = `TEAM-${event.eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setGeneratedTeamId(newTeamId);
    }
  }, [userRole, isTeamEvent, event.eventId, generatedTeamId]);

  const copyTeamId = () => {
    if (generatedTeamId) {
      navigator.clipboard.writeText(generatedTeamId);
      setTeamIdCopied(true);
      setTimeout(() => setTeamIdCopied(false), 2000);
    }
  };

  // Validate Team ID
  const validateTeamId = async () => {
    if (!teamId.trim()) {
      setTeamValidation(null);
      return;
    }

    setIsValidatingTeam(true);
    setTeamValidation(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTeamValidation({
          valid: false,
          memberCount: 0,
          hasLeader: false,
          isFull: false,
          canJoin: false,
          message: '❌ Please login to validate the Team ID.',
        });
        setIsValidatingTeam(false);
        return;
      }

      // Fetch registrations for this team
      const response = await fetch(`/api/registrations?eventId=${event.eventId}&teamId=${teamId.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate team');
      }

      const memberCount = data.total || 0;
      const registrations = data.registrations || [];

      // Check if there's a leader (first registration with this team ID)
      const hasLeader = registrations.length > 0;
      const isFull = memberCount >= maxTeamMembers;
      const canJoin = hasLeader && !isFull;

      let message = '';
      if (!hasLeader) {
        message = '❌ Invalid Team ID. No team found with this ID.';
      } else if (isFull) {
        message = `🔴 Team is full (${memberCount}/${maxTeamMembers} members). Cannot join.`;
      } else {
        message = `✅ Valid Team ID! ${memberCount}/${maxTeamMembers} members registered. You can join!`;
      }

      setTeamValidation({
        valid: hasLeader,
        memberCount,
        hasLeader,
        isFull,
        canJoin,
        message,
      });
    } catch (error) {
      console.error('Error validating team:', error);
      setTeamValidation({
        valid: false,
        memberCount: 0,
        hasLeader: false,
        isFull: false,
        canJoin: false,
        message: '❌ Error validating Team ID. Please try again.',
      });
    } finally {
      setIsValidatingTeam(false);
    }
  };

  // Reset validation when team ID changes
  useEffect(() => {
    setTeamValidation(null);
  }, [teamId]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null);
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountValidation(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDiscountValidation({
          valid: false,
          message: '❌ Please login to apply discount codes.',
        });
        setIsValidatingDiscount(false);
        return;
      }

      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          discountCode: discountCode.trim().toUpperCase(),
          userEmail: currentUser?.toLowerCase(),
          eventId: event.eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setDiscountValidation({
          valid: false,
          message: data.message || '❌ Invalid discount code for this event.',
        });
        setAppliedDiscount(null);
      } else {
        // Use the discount amount from the API
        const discountAmount = data.discount.discountAmount;
        console.log('Discount validation response:', {
          valid: data.valid,
          discountCode: data.discount.discountCode,
          discountAmount: discountAmount,
          type: typeof discountAmount,
        });
        const finalPrice = Math.max(0, event.regFees - discountAmount);

        setDiscountValidation({
          valid: true,
          message: `✅ Discount applied! You save ₹${discountAmount}`,
          discountedPrice: finalPrice,
        });
        setAppliedDiscount({
          code: discountCode.trim().toUpperCase(),
          discountAmount,
        });
      }
    } catch (error: any) {
      console.error('Error validating discount:', error);
      setDiscountValidation({
        valid: false,
        message: '❌ Error validating discount. Please try again.',
      });
      setAppliedDiscount(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Reset discount validation when discount code changes
  useEffect(() => {
    setDiscountValidation(null);
    setAppliedDiscount(null);
  }, [discountCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, etc.)');
        return;
      }

      setError('');

      // Compress the receipt image to 200KB before storing
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1920,
        convertSize: 200000, // Try to convert to JPEG if size exceeds 200KB
        success: (compressedResult) => {
          // Convert Blob to File
          const compressedFile = new File([compressedResult], file.name, {
            type: compressedResult.type,
            lastModified: Date.now(),
          });
          
          // Check if compressed file is still larger than 200KB
          if (compressedFile.size > 200000) {
            // Try again with lower quality
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
                
                // Store the compressed file for later upload
                setReceiptFile(finalFile);
                
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                  setReceiptPreview(reader.result as string);
                };
                reader.readAsDataURL(finalFile);
              },
              error: (err) => {
                console.error('Secondary compression error:', err);
                setError('Failed to compress receipt. Please try a smaller file.');
              },
            });
          } else {
            // Store the compressed file for later upload
            setReceiptFile(compressedFile);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
          }
        },
        error: (err) => {
          console.error('Compression error:', err);
          setError('Failed to compress receipt. Please try a different file.');
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!currentUser) {
        setError('You must be logged in to register');
        setIsSubmitting(false);
        return;
      }

      // Only require receipt if event has fees AND user is not a team member
      if (event.regFees > 0 && (!isTeamEvent || userRole === 'leader') && !receiptFile) {
        setError('Please upload payment receipt');
        setIsSubmitting(false);
        return;
      }

      // For team events, validate team ID
      if (isTeamEvent) {
        if (userRole === 'member') {
          if (!teamId.trim()) {
            setError('Please enter the Team ID provided by your team leader');
            setIsSubmitting(false);
            return;
          }
          
          // Check if team was validated
          if (!teamValidation) {
            setError('Please verify the Team ID before submitting');
            setIsSubmitting(false);
            return;
          }

          // Check if team is valid and has space
          if (!teamValidation.valid) {
            setError('Invalid Team ID. Please verify with your team leader.');
            setIsSubmitting(false);
            return;
          }

          if (teamValidation.isFull) {
            setError('This team is full. Cannot join.');
            setIsSubmitting(false);
            return;
          }

          if (!teamValidation.canJoin) {
            setError('Cannot join this team. Please verify the Team ID.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Determine the final team ID (empty for individual events)
      const finalTeamId = isTeamEvent 
        ? (userRole === 'leader' ? generatedTeamId : teamId.trim())
        : ''; // Empty string for individual events

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // For free events OR team members (no payment required), submit directly without receipt
      if (event.regFees === 0 || (isTeamEvent && userRole === 'member')) {
        // For free events with accommodation, need to upload receipt
        let receiptUrl = '';
        if (event.regFees === 0 && accommodationRequired && accommodationMembers > 0) {
          if (!receiptFile) {
            setError('Please upload payment receipt for accommodation');
            setIsSubmitting(false);
            return;
          }
          receiptUrl = await uploadImageToFirebase(
            receiptFile,
            'receipts',
            `receipt_accommodation_${event.eventId}_${currentUser}_${Date.now()}`
          );
        }

        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.eventId,
            userId: currentUserId,
            teamId: finalTeamId,
            feesPaid: receiptUrl || '', // Empty for free events or team members, URL if accommodation payment
            discount: appliedDiscount?.discountAmount || 0,
            accommodationRequired: accommodationRequired,
            accommodationMembers: accommodationMembers,
            accommodationFees: accommodationFees,
            isLeader: isTeamEvent && userRole === 'leader', // Flag to indicate if creating new team
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
        return;
      }

      // Upload file to Firebase Storage for paid events (only leaders or individual participants)
      try {
        const firebaseUrl = await uploadImageToFirebase(
          receiptFile!,
          'receipts',
          `receipt_${event.eventId}_${currentUser}_${Date.now()}`
        );

        // Submit registration with Firebase URL
        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.eventId,
            userId: currentUserId,
            teamId: finalTeamId,
            feesPaid: firebaseUrl,
            discount: appliedDiscount?.discountAmount || 0,
            accommodationRequired: accommodationRequired,
            accommodationMembers: accommodationMembers,
            accommodationFees: accommodationFees,
            isLeader: isTeamEvent && userRole === 'leader', // Flag to indicate if creating new team
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } catch (uploadError) {
        setError('Failed to upload receipt image. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#140655] via-[#2a0a56] to-[#4321a9] rounded-3xl shadow-2xl border-2 border-[#b53da1]/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-[#010101]/50 hover:bg-[#010101]/70 rounded-full transition-all duration-300 group"
          >
            <X className="w-6 h-6 text-[#fea6cc] group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>

          {/* Auth Check Loading */}
          {isCheckingAuth || isCheckingRegistration ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#fea6cc] animate-spin mb-4" />
              <p className="text-[#ffd4b9]">
                {isCheckingAuth ? 'Checking authentication...' : 'Checking registration status...'}
              </p>
            </div>
          ) : !currentUser ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Login Required</h3>
              <p className="text-[#fea6cc] mb-6">You must be logged in to register for events.</p>
              <Link
                href="/register"
                className="inline-block bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-bold py-3 px-8 rounded-xl hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 transform hover:scale-105"
              >
                Go to Login
              </Link>
            </div>
          ) : existingRegistration ? (
            /* Already Registered Status View */
            <>
              <div className="p-6 pb-4 border-b border-[#b53da1]/30">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fea6cc] via-[#ffd4b9] to-[#fea7a0] font-arabian">
                  Already Registered
                </h2>
                <p className="text-[#fea6cc]/80 mt-2 font-medium">{event.eventName}</p>
              </div>

              <div className="p-8">
                <div className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 border-2 border-[#10b981]/50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Registration Complete</h3>
                      <p className="text-[#ffd4b9] text-sm">You have already registered for this event</p>
                    </div>
                  </div>
                </div>

                {/* Registration Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-[#010101]/30 border border-[#b53da1]/30 rounded-xl p-4">
                    <h4 className="text-[#fea6cc] font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Registration Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#ffd4b9]/70">Verification Status:</span>
                        <span className={`font-semibold ${existingRegistration.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                          {existingRegistration.verified ? '✓ Verified' : '⏳ Pending Verification'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#ffd4b9]/70">Registration Date:</span>
                        <span className="text-white font-medium">
                          {new Date(existingRegistration.dateTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#ffd4b9]/70">Total Fees:</span>
                        <span className="text-white font-bold">₹{existingRegistration.totalFees || event.regFees}</span>
                      </div>
                      {existingRegistration.teamId && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#ffd4b9]/70">Team ID:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-xs bg-[#010101]/50 px-2 py-1 rounded">
                              {existingRegistration.teamId}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(existingRegistration.teamId);
                                setTeamIdCopied(true);
                                setTimeout(() => setTeamIdCopied(false), 2000);
                              }}
                              className="p-1.5 bg-[#b53da1]/40 hover:bg-[#b53da1]/60 rounded transition-all"
                            >
                              <Copy className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      )}
                      {existingRegistration.accommodationRequired && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#ffd4b9]/70">Accommodation:</span>
                            <span className="text-white font-medium">
                              ✓ Booked ({existingRegistration.accommodationMembers} members)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#ffd4b9]/70">Accommodation Fees:</span>
                            <span className="text-white font-bold">₹{existingRegistration.accommodationFees}</span>
                          </div>
                        </>
                      )}
                      {existingRegistration.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#ffd4b9]/70">Discount Applied:</span>
                          <span className="text-green-400 font-bold">-₹{existingRegistration.discount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!existingRegistration.verified && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-200 text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>
                          Your registration is pending verification by our admin team. You will receive a confirmation email once verified.
                          {event.regFees > 0 && ' Please ensure your payment receipt has been submitted correctly.'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-bold py-3 px-6 rounded-xl hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 pb-4 border-b border-[#b53da1]/30">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fea6cc] via-[#ffd4b9] to-[#fea7a0] font-arabian">
                  Event Registration
                </h2>
                <p className="text-[#fea6cc]/80 mt-2 font-medium">{event.eventName}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-[#ffd4b9]">
                    <IndianRupee className="w-4 h-4" />
                    ₹{event.regFees}
                  </span>
                  <span className="flex items-center gap-1 text-[#ffd4b9]">
                    <Users className="w-4 h-4" />
                    {isTeamEvent ? `Team (Max ${maxTeamMembers})` : 'Individual'}
                  </span>
                </div>
              </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-[#010101]/90 backdrop-blur-sm rounded-3xl z-20 p-6"
              >
                <div className="text-center max-w-md">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-[#fea6cc] mb-4">Your registration is pending verification.</p>
                  
                  {/* Team ID Display for Leaders after successful registration */}
                  {isTeamEvent && userRole === 'leader' && generatedTeamId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 bg-gradient-to-r from-[#4321a9]/30 to-[#642aa5]/30 border-2 border-[#ed6ab8]/50 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-[#ffd4b9]" />
                        <p className="text-[#ffd4b9] font-semibold text-sm">Your Team ID</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-[#010101]/40 rounded-lg p-3 mb-3">
                        <p className="text-white font-mono text-base font-bold break-all flex-1">{generatedTeamId}</p>
                        <button
                          type="button"
                          onClick={copyTeamId}
                          className="flex-shrink-0 p-2 bg-[#b53da1]/40 hover:bg-[#b53da1]/60 rounded-lg transition-all duration-300"
                        >
                          {teamIdCopied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#ffd4b9]" />
                          )}
                        </button>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span><strong>Important:</strong> Share this Team ID with your teammates only. They will need this ID to join your team during registration.</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Role Selection for Team Events - Subtle Toggle */}
            {isTeamEvent && (
              <div className="flex items-center justify-between mb-4">
                <label className="text-[#ffd4b9] text-sm font-medium">
                  Registration as:
                </label>
                <div className="flex items-center gap-2 bg-[#010101]/40 rounded-full p-1 border border-[#b53da1]/30">
                  <button
                    type="button"
                    onClick={() => setUserRole('leader')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      userRole === 'leader'
                        ? 'bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white shadow-lg'
                        : 'text-[#fea6cc]/60 hover:text-[#fea6cc]'
                    }`}
                  >
                    👑 Leader
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('member')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      userRole === 'member'
                        ? 'bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white shadow-lg'
                        : 'text-[#fea6cc]/60 hover:text-[#fea6cc]'
                    }`}
                  >
                    🤝 Member
                  </button>
                </div>
              </div>
            )}



            {/* Team ID Input for Members */}
            {isTeamEvent && userRole === 'member' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="text-[#ffd4b9] font-semibold flex items-center gap-2">
                  🎫 Enter Team ID
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="TEAM-XXXXX-XXXXX"
                    className="flex-1 px-4 py-3 bg-[#010101]/40 border-2 border-[#b53da1]/30 rounded-xl text-white placeholder-[#fea6cc]/50 focus:border-[#ed6ab8] focus:outline-none focus:ring-2 focus:ring-[#ed6ab8]/30 transition-all duration-300 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={validateTeamId}
                    disabled={!teamId.trim() || isValidatingTeam}
                    className="px-6 py-3 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-bold rounded-xl hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isValidatingTeam ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#fea6cc]/80">
                  Ask your team leader for the Team ID to join their team
                </p>

                {/* Team Validation Status */}
                {teamValidation && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 ${
                      teamValidation.canJoin
                        ? 'bg-green-500/10 border-green-500/50'
                        : teamValidation.valid && teamValidation.isFull
                        ? 'bg-red-500/10 border-red-500/50'
                        : 'bg-red-500/10 border-red-500/50'
                    }`}
                  >
                    <p className={`font-semibold mb-2 ${
                      teamValidation.canJoin ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {teamValidation.message}
                    </p>
                    
                    {teamValidation.valid && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#fea6cc]" />
                          <span className="text-[#ffd4b9]">
                            Team Members: <strong>{teamValidation.memberCount}/{maxTeamMembers}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {teamValidation.hasLeader ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">Team Leader exists</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400">No Team Leader found</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {teamValidation.isFull ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400">Team is full</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">
                                {maxTeamMembers - teamValidation.memberCount} spot(s) available
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Team Members Section */}
            <div className="space-y-3">
              <label className="text-[#ffd4b9] font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Email
              </label>

              <div className="space-y-3">
                {/* Show only current user's email (read-only) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={currentUser || ''}
                      readOnly
                      className="w-full px-4 py-3 bg-[#010101]/60 border-2 border-[#b53da1]/30 rounded-xl text-white placeholder-[#fea6cc]/50 cursor-not-allowed transition-all duration-300"
                    />
                    {isTeamEvent && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gradient-to-r from-[#4321a9] to-[#642aa5] text-white px-2 py-1 rounded-full">
                        {userRole === 'leader' ? 'Leader' : 'Member'}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

              <p className="text-xs text-[#fea6cc]/60 italic">
                {isTeamEvent && userRole === 'leader'
                  ? `Share your Team ID with members. Each member must register individually with the Team ID.`
                  : isTeamEvent && userRole === 'member'
                  ? 'You will join the team using the Team ID provided by your leader.'
                  : 'Your registered email address for this event.'}
              </p>
            </div>

            {/* Payment notice for team members */}
            {event.regFees > 0 && isTeamEvent && userRole === 'member' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-blue-400 font-semibold">Team Member Notice</p>
                    <p className="text-sm text-[#fea6cc]">
                      Payment is handled by your team leader. You don't need to upload a receipt.
                      Just verify your Team ID and submit to join the team.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Discount Code Section - Only for paid events */}
            {event.regFees > 0 && (!isTeamEvent || userRole === 'leader') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="text-[#ffd4b9] font-semibold flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Discount Code (Optional)
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    maxLength={8}
                    className="flex-1 px-4 py-3 bg-[#010101]/40 border-2 border-[#b53da1]/30 rounded-xl text-white placeholder-[#fea6cc]/50 focus:border-[#ed6ab8] focus:outline-none focus:ring-2 focus:ring-[#ed6ab8]/30 transition-all duration-300 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={validateDiscountCode}
                    disabled={!discountCode.trim() || isValidatingDiscount || !!appliedDiscount}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {isValidatingDiscount ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Applying...
                      </>
                    ) : appliedDiscount ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Applied
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {/* Discount Validation Status */}
                {discountValidation && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 ${
                      discountValidation.valid
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-red-500/10 border-red-500/50'
                    }`}
                  >
                    <p className={`font-semibold ${
                      discountValidation.valid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {discountValidation.message}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Accommodation Section */}
            {(!isTeamEvent || userRole === 'leader') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="accommodation"
                    checked={accommodationRequired}
                    onChange={(e) => {
                      setAccommodationRequired(e.target.checked);
                      if (!e.target.checked) {
                        setAccommodationMembers(0);
                        setAccommodationError('');
                      }
                    }}
                    className="w-5 h-5 rounded cursor-pointer accent-purple-500"
                  />
                  <label htmlFor="accommodation" className="text-[#ffd4b9] font-semibold cursor-pointer">
                    🏨 Accommodation Required
                  </label>
                </div>

                {/* Accommodation Details */}
                {accommodationRequired && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 ml-8 pt-3 border-t border-purple-500/30"
                  >
                    <div>
                      <label className="text-sm text-[#fea6cc] font-medium mb-2 block">
                        Number of Members Needing Accommodation
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={accommodationMembers}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setAccommodationError('');
                            
                            // Validate: must be positive and less than or equal to max team members
                            if (value < 0) {
                              setAccommodationError('Number of members cannot be negative');
                              setAccommodationMembers(0);
                            } else if (value > maxTeamMembers) {
                              setAccommodationError(`Cannot exceed maximum team members (${maxTeamMembers})`);
                              setAccommodationMembers(maxTeamMembers);
                            } else {
                              setAccommodationMembers(value);
                            }
                          }}
                          min="0"
                          max={maxTeamMembers}
                          placeholder="Enter number of members"
                          className="flex-1 px-4 py-2 bg-[#010101]/40 border-2 border-purple-500/30 rounded-lg text-white placeholder-[#fea6cc]/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                        <span className="text-[#fea6cc] font-semibold whitespace-nowrap">Max: {maxTeamMembers}</span>
                      </div>
                      {accommodationError && (
                        <p className="text-red-400 text-sm mt-2">⚠️ {accommodationError}</p>
                      )}
                    </div>

                    {/* Accommodation Fees Breakdown */}
                    {accommodationMembers > 0 && !accommodationError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-3 space-y-2"
                      >
                        <p className="text-sm text-[#fea6cc]">
                          <span className="font-semibold">{accommodationMembers}</span>
                          {' members × '}
                          <span className="font-semibold">₹1500</span>
                          {' per member = '}
                          <span className="font-bold text-purple-300">₹{accommodationMembers * 1500}</span>
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Payment Receipt Upload or Free Registration */}
            {/* Only show payment for: Individual events, Team leaders, or Free events */}
            {event.regFees > 0 && (!isTeamEvent || userRole === 'leader') ? (
              <div className="space-y-3">
                <label className="text-[#ffd4b9] font-semibold flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Payment Details
                </label>

                {/* Discounted Price Display */}
                {appliedDiscount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 font-semibold">Discounted Price</p>
                        <p className="text-sm text-[#fea6cc]">Code: {appliedDiscount.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="line-through text-gray-400 text-sm">₹{event.regFees}</p>
                        <p className="text-3xl font-bold text-green-400">₹{event.regFees - appliedDiscount.discountAmount}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bank Transfer Details */}
                <div className="bg-[#010101]/40 border-2 border-[#b53da1]/50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-[#ffd4b9] font-bold text-xl mb-2">Money Transfer Details</h3>
                      
                      {/* Price Breakdown */}
                      <div className="space-y-2 mb-4">
                        {/* Event Fee */}
                        <div className="flex justify-center gap-4 text-sm">
                          <span className="text-[#fea6cc]">Event Fee:</span>
                          {appliedDiscount ? (
                            <>
                              <span className="line-through text-gray-400">₹{event.regFees}</span>
                              <span className="font-semibold text-green-400">₹{priceAfterDiscount}</span>
                              <span className="text-green-400 text-xs">(-₹{appliedDiscount.discountAmount})</span>
                            </>
                          ) : (
                            <span className="font-semibold text-white">₹{event.regFees}</span>
                          )}
                        </div>

                        {/* Accommodation Fee */}
                        {accommodationRequired && accommodationMembers > 0 && (
                          <div className="flex justify-center gap-4 text-sm">
                            <span className="text-[#fea6cc]">Accommodation ({accommodationMembers} members):</span>
                            <span className="font-semibold text-purple-300">₹{accommodationFees}</span>
                          </div>
                        )}

                        {/* Total */}
                        <div className="border-t border-[#b53da1]/30 pt-2 flex justify-center gap-4 text-lg">
                          <span className="text-[#ffd4b9] font-bold">Total Amount:</span>
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹{totalAmount}</span>
                        </div>
                      </div>
                      
                      {appliedDiscount && (
                        <p className="text-green-400 text-sm">
                          You save ₹{appliedDiscount.discountAmount} with discount!
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Name of the payee:</p>
                        <p className="text-white font-semibold text-sm">PUNJAB ENGG. COLLEGE (DEEMED TO BE UNIVERISTY)</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Name of the bank:</p>
                        <p className="text-white font-semibold text-sm">State Bank of India</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Bank Account Number:</p>
                        <p className="text-white font-semibold text-sm font-mono">00000040903415912</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Type of Bank Account:</p>
                        <p className="text-white font-semibold text-sm">Current Account</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">GSTIN:</p>
                        <p className="text-white font-semibold text-sm font-mono">04AABTP1179L1ZE</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Branch Code:</p>
                        <p className="text-white font-semibold text-sm">2452 MICR</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">Code of the Bank:</p>
                        <p className="text-white font-semibold text-sm">16002008</p>
                      </div>

                      <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                        <p className="text-xs text-[#fea6cc]/60 mb-1">IFSC:</p>
                        <p className="text-white font-semibold text-sm font-mono">SBIN0002452</p>
                      </div>
                    </div>

                    <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                      <p className="text-xs text-[#fea6cc]/60 mb-1">Bank Branch (Full address):</p>
                      <p className="text-white font-semibold text-sm">State Bank of India, Punjab Engineering College, Sector 12, Chandigarh-160012</p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                      <p className="text-yellow-200 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span><strong>Important:</strong> Please use these bank details for payment transfer and upload the payment receipt below.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <label className="text-[#ffd4b9] font-semibold flex items-center gap-2 mt-4">
                  <Upload className="w-5 h-5" />
                  Upload Payment Receipt
                </label>

                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-[#b53da1]/50 rounded-xl p-6 bg-[#010101]/30 hover:bg-[#010101]/40 hover:border-[#ed6ab8] transition-all duration-300 cursor-pointer group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {receiptPreview ? (
                      <div className="space-y-3">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-full max-h-48 object-contain rounded-lg"
                        />
                        <p className="text-sm text-[#fea6cc] text-center">{receiptFile?.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptFile(null);
                            setReceiptPreview('');
                          }}
                          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 text-sm"
                        >
                          Remove Receipt
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-[#b53da1] mx-auto mb-3 group-hover:text-[#ed6ab8] group-hover:scale-110 transition-all duration-300" />
                        <p className="text-[#fea6cc] font-medium mb-1">Click to upload payment receipt</p>
                        <p className="text-xs text-[#fea6cc]/60">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#4321a9]/20 border border-[#b53da1]/30 rounded-lg p-3">
                    <p className="text-sm text-[#ffd4b9] font-medium mb-2">Payment Instructions:</p>
                    <ol className="text-xs text-[#fea6cc]/80 space-y-1 list-decimal list-inside">
                      <li>Transfer ₹{totalAmount} to the bank account mentioned above</li>
                      <li>Take a screenshot of the payment confirmation/receipt</li>
                      <li>Upload the screenshot above</li>
                      <li>Your registration will be verified by the admin</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* If accommodation is required, show payment section */}
                {accommodationRequired && accommodationMembers > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/40 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-purple-300 mb-4">🏨 Accommodation Payment Required</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#fea6cc]">Base Event Fee:</span>
                          <span className="font-semibold text-white">₹0 (Free)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#fea6cc]">Accommodation ({accommodationMembers} members):</span>
                          <span className="font-semibold text-purple-300">₹{accommodationFees}</span>
                        </div>
                        <div className="border-t border-purple-500/30 pt-2 flex justify-between text-lg font-bold">
                          <span className="text-purple-200">Total Amount:</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹{accommodationFees}</span>
                        </div>
                      </div>
                      <p className="text-sm text-purple-200">Payment required for accommodation. Please transfer the amount below.</p>
                    </div>

                    {/* Bank Transfer Details for accommodation */}
                    <div className="bg-[#010101]/40 border-2 border-[#b53da1]/50 rounded-xl p-6">
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <h3 className="text-[#ffd4b9] font-bold text-xl mb-2">Money Transfer Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                            <p className="text-xs text-[#fea6cc]/60 mb-1">Name of the payee:</p>
                            <p className="text-white font-semibold text-sm">PUNJAB ENGG. COLLEGE (DEEMED TO BE UNIVERISTY)</p>
                          </div>

                          <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                            <p className="text-xs text-[#fea6cc]/60 mb-1">Name of the bank:</p>
                            <p className="text-white font-semibold text-sm">State Bank of India</p>
                          </div>

                          <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                            <p className="text-xs text-[#fea6cc]/60 mb-1">Account Number:</p>
                            <p className="text-white font-semibold text-sm font-mono">35971055370</p>
                          </div>

                          <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                            <p className="text-xs text-[#fea6cc]/60 mb-1">Code of the Bank:</p>
                            <p className="text-white font-semibold text-sm">16002008</p>
                          </div>

                          <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                            <p className="text-xs text-[#fea6cc]/60 mb-1">IFSC:</p>
                            <p className="text-white font-semibold text-sm font-mono">SBIN0002452</p>
                          </div>
                        </div>

                        <div className="bg-[#2a0a56]/40 rounded-lg p-3">
                          <p className="text-xs text-[#fea6cc]/60 mb-1">Bank Branch (Full address):</p>
                          <p className="text-white font-semibold text-sm">State Bank of India, Punjab Engineering College, Sector 12, Chandigarh-160012</p>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                          <p className="text-yellow-200 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Important:</strong> Please transfer ₹{accommodationFees} to the bank account for accommodation and upload the payment receipt below.</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="text-[#ffd4b9] font-semibold flex items-center gap-2 mt-4">
                      <Upload className="w-5 h-5" />
                      Upload Payment Receipt
                    </label>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-purple-500/5"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {receiptPreview ? (
                        <div className="relative">
                          <img src={receiptPreview} alt="Receipt" className="w-full h-40 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptFile(null);
                              setReceiptPreview('');
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                          >
                            Remove Receipt
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-[#b53da1] mx-auto mb-3 group-hover:text-[#ed6ab8] group-hover:scale-110 transition-all duration-300" />
                          <p className="text-[#fea6cc] font-medium mb-1">Click to upload payment receipt</p>
                          <p className="text-xs text-[#fea6cc]/60">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-xl p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Free Registration</h3>
                    <p className="text-[#fea6cc]">This event is free! No payment required.</p>
                    <p className="text-sm text-[#ffd4b9] mt-3">Click Submit to complete your registration</p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#010101]/50 hover:bg-[#010101]/70 text-[#fea6cc] font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-[#b53da1]/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] hover:from-[#ed6ab8] hover:to-[#b53da1] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
