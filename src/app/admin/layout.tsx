'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin key is stored in localStorage
    const storedKey = localStorage.getItem('crativo-admin-key');
    if (storedKey) {
      verifyKey(storedKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyKey = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/ads?key=${encodeURIComponent(key)}`);
      if (res.ok) {
        localStorage.setItem('crativo-admin-key', key);
        setIsAuthenticated(true);
        setError('');
      } else {
        localStorage.removeItem('crativo-admin-key');
        setError('Invalid admin key');
        setIsAuthenticated(false);
      }
    } catch {
      setError('Failed to verify key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    verifyKey(adminKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('crativo-admin-key');
    setIsAuthenticated(false);
    setAdminKey('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-zinc-400 mb-6">Enter your admin key to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Admin key"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <Link 
              href="/"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Admin Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Site
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-white font-medium">Admin</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link 
              href="/admin/carbon"
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Carbon Ads
            </Link>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Admin Content */}
      {children}
    </div>
  );
}
