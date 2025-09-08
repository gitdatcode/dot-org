import { useState, useEffect } from 'react';

interface AccessCheckProps {
  slug: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

// Client-side component to check access to premium content
export default function AccessCheck({ slug, children, fallback }: AccessCheckProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/ghost/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setHasAccess(data.hasAccess);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="mt-2 text-neutral-600">Checking access...</p>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}