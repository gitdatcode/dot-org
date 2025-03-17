import { useState, useEffect, ReactNode } from 'react';
import type { GhostMember } from '../../lib/api/ghost/types';

interface ProtectedProps {
  children: ReactNode;
  paidOnly?: boolean;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export default function Protected({
  children,
  paidOnly = false,
  fallback,
  loadingFallback
}: ProtectedProps) {
  const [member, setMember] = useState<GhostMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch('/api/ghost/member', {
          credentials: 'include'
        });
        
        if (!response.ok) {
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

  // Show loading state
  if (loading) {
    return (
      <div>
        {loadingFallback || (
          <div className="p-4 text-center text-neutral-600">
            <svg className="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Verifying access...</p>
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-error">
        <p>{error}</p>
      </div>
    );
  }

  // No member or member doesn't have paid access when required
  if (!member || (paidOnly && !member.paid)) {
    return (
      <div>
        {fallback || (
          <div className="p-4 border border-neutral-300 rounded-md bg-neutral-50 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {!member ? 'Sign in required' : 'Paid membership required'}
            </h3>
            <p className="text-neutral-600 mb-4">
              {!member
                ? 'Please sign in to access this content'
                : 'This content is only available to paid members'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Member has access - render content
  return <>{children}</>;
}