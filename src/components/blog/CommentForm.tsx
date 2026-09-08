'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_BODY_LENGTH, MAX_NAME_LENGTH } from '@/types/comment';

const IDENTITY_KEY = 'crativo-comment-identity';

interface StoredIdentity {
  name: string;
  email: string;
}

/** Remember who you are between comments so you only type it once. */
function loadIdentity(): StoredIdentity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return { name: '', email: '' };
    const parsed = JSON.parse(raw);
    return { name: parsed.name || '', email: parsed.email || '' };
  } catch {
    return { name: '', email: '' };
  }
}

function saveIdentity(identity: StoredIdentity) {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    // Private browsing, storage disabled - not worth failing the comment over.
  }
}

interface CommentFormProps {
  slug: string;
  parentId?: number | null;
  replyingTo?: string;
  onPosted: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentForm({
  slug,
  parentId = null,
  replyingTo,
  onPosted,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  // Name and email are uncontrolled so we can restore them from localStorage
  // after mount without the server-rendered HTML disagreeing about their value.
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const identity = loadIdentity();
    if (nameRef.current && identity.name) nameRef.current.value = identity.name;
    if (emailRef.current && identity.email) emailRef.current.value = identity.email;
  }, []);

  const remaining = MAX_BODY_LENGTH - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = nameRef.current?.value.trim() ?? '';
    const email = emailRef.current?.value.trim() ?? '';
    const body = content.trim();

    if (!name || !body || status === 'loading') return;

    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          parentId,
          author: name,
          email,
          content: body,
          website: honeypotRef.current?.value ?? '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setError(data.error || 'Something went wrong. Try again.');
        return;
      }

      saveIdentity({ name, email });
      setContent('');
      setStatus('idle');
      onPosted();
    } catch {
      setStatus('error');
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyingTo && (
        <p className="text-sm text-zinc-500">
          Replying to <span className="text-zinc-300">{replyingTo}</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          ref={nameRef}
          type="text"
          name="author"
          placeholder="Your name"
          required
          maxLength={MAX_NAME_LENGTH}
          autoComplete="name"
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="Email (optional, for your avatar)"
          autoComplete="email"
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Honeypot - hidden from people, irresistible to bots. */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute w-px h-px -left-[9999px] opacity-0"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_BODY_LENGTH))}
        placeholder={parentId ? 'Write a reply...' : 'Join the discussion...'}
        required
        rows={parentId ? 3 : 4}
        autoFocus={autoFocus}
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-y"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs ${remaining < 100 ? 'text-amber-400' : 'text-zinc-600'}`}>
          {remaining < 100
            ? `${remaining} characters left`
            : 'Plain text only, no markdown'}
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={status === 'loading' || !content.trim()}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Posting...' : parentId ? 'Reply' : 'Post comment'}
          </button>
        </div>
      </div>
    </form>
  );
}
