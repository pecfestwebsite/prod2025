'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
      } else {
        setUser(data.user || null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
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
