'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface PasswordGateProps {
  children: ReactNode;
  contentId: string;
  password: string;
  title?: string;
  description?: string;
}

export default function PasswordGate({
  children,
  contentId,
  password,
  title = 'Protected Content',
  description = 'This content is password protected. Enter the password to continue.',
}: PasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const storageKey = `crativo-unlocked-${contentId}`;

  useEffect(() => {
    // Check if already unlocked in this session
    const unlocked = sessionStorage.getItem(storageKey);
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (inputPassword === password) {
      sessionStorage.setItem(storageKey, 'true');
      setIsUnlocked(true);
    } else {
      setError('Incorrect password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center t-label text-graphite gap-2">
        <span className="led" data-on="true" /> Checking access
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="py-24 flex justify-center">
      <div className={`w-full max-w-md border border-ink bg-paper ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between px-4 h-10 border-b border-ink t-label">
          <span className="flex items-center gap-2">
            <span className="led" data-on="true" />
            Access restricted
          </span>
          <Lock size={14} strokeWidth={1.5} />
        </div>
        <div className="p-6 md:p-8">
          <h2 className="t-h2 mb-3">{title}</h2>
          <p className="text-graphite mb-8">{description}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="t-label text-graphite">Password</span>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setError('');
                }}
                className="field"
                autoFocus
                autoComplete="off"
              />
            </label>
            {error && <p className="text-signal-ink text-sm">{error}</p>}
            <button type="submit" className="btn w-full justify-between" data-variant="solid">
              Unlock <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </form>
          <p className="t-label text-graphite mt-6">No password? Contact the author.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s steps(8, end);
        }
      `}</style>
    </div>
  );
}
