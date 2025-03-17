import { useState, useEffect } from 'react';

interface Member {
  uuid?: string;
  email: string;
  name?: string;
  paid?: boolean;
}

export default function UserMenu() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch the current member on mount
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
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/ghost/member', {
        method: 'DELETE',
        credentials: 'include',
      });

      // Refresh the page after sign out
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600">
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
          <span>Loading...</span>
        </button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center space-x-4">
        <a
          href="/signin"
          className="text-gray-700 hover:text-purple-600"
        >
          Sign In
        </a>
        <a
          href="/signin"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
          onClick={() => {
            // Automatically switch to signup tab
            localStorage.setItem('auth_tab', 'signup');
          }}
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 text-gray-700 hover:text-purple-600"
      >
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
        </div>
        <span>{member.name || member.email}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{member.name || 'Member'}</p>
            <p className="text-xs text-gray-500">{member.email}</p>
            {member.paid && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                Paid Member
              </span>
            )}
          </div>
          <a
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Account Settings
          </a>
          {member.paid && (
            <a
              href="/account/subscription"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Manage Subscription
            </a>
          )}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
