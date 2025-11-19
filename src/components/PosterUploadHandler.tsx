'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import PosterUploadModal from './PosterUploadModal';

export default function PosterUploadHandler() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per session when user is authenticated
    if (!loading && user && !hasChecked && !checking) {
      checkFormStatus();
    }
  }, [user, loading, hasChecked, checking]);

  const checkFormStatus = async () => {
    if (!user?.userId || !user?.email) return;

    setChecking(true);
    try {
      const response = await fetch(
        `/api/registration-form?userId=${encodeURIComponent(user.userId)}&email=${encodeURIComponent(user.email)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Show modal only if user hasn't submitted the form
        if (!data.hasSubmitted) {
          // Small delay to ensure smooth transition after login/register
          setTimeout(() => {
            setShowModal(true);
          }, 2500);
        }
      }
    } catch (error) {
      console.error('Error checking registration form status:', error);
    } finally {
      setChecking(false);
      setHasChecked(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    // Mark as checked so we don't show it again in this session
    setHasChecked(true);
  };

  if (!user) return null;

  return (
    <PosterUploadModal
      isOpen={showModal}
      onClose={handleClose}
      userId={user.userId || ''}
      userEmail={user.email}
      isFirstTime={true}
    />
  );
}
