'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  email: string;
  userId?: string;
  name?: string;
  college?: string;
  studentId?: string;
  phoneNumber?: string;
  referralCode?: string;
  branch?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const checkAuthInProgress = useRef(false);

  useEffect(() => {
    checkAuth();

    // Listen for custom token change event
    const handleTokenChange = () => {
      checkAuth();
    };

    window.addEventListener('tokenChanged', handleTokenChange);

    // Also listen for storage changes (for cross-tab scenarios)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuth = async () => {
    // Prevent duplicate simultaneous calls
    if (checkAuthInProgress.current) {
      console.log('⏭️ Skipping duplicate checkAuth call');
      return;
    }

    checkAuthInProgress.current = true;

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid or expired, remove it
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Optionally fetch full user details from /api/auth/me
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        setUser(meData.user || null);
        setLoading(false);
      } else {
        setUser(data.user || null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
    } finally {
      checkAuthInProgress.current = false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clean up local storage and redirect
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/';
    }
  };

  return { user, loading, logout, refreshAuth: checkAuth };
}
