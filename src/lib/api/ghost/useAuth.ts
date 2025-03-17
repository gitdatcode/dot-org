import { useState, useEffect } from 'react';
import type { GhostMember } from './types';

/**
 * Hook for accessing authentication state
 */
export function useAuth() {
  const [member, setMember] = useState<GhostMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current member on mount
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch('/api/ghost/member', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          setMember(null);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setMember(data.success ? data.member : null);
      } catch (err) {
        console.error('Failed to fetch member:', err);
        setError('Failed to verify authentication status');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ghost/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Authentication failed');
        return false;
      }
      
      setMember(data.member);
      return true;
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ghost/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'signup',
          name, 
          email, 
          password 
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        return false;
      }
      
      setMember(data.member);
      return true;
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ghost/member', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setMember(null);
        return true;
      }
      
      setError('Failed to sign out');
      return false;
    } catch (err) {
      console.error('Sign out error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!member;
  const isPaid = !!member?.paid;

  return {
    member,
    loading,
    error,
    isAuthenticated,
    isPaid,
    signIn,
    signUp,
    signOut
  };
}