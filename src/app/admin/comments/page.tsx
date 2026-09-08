'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminComment, CommentStatus } from '@/types/comment';

const FILTERS: { label: string; value: CommentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Spam', value: 'spam' },
  { label: 'Removed', value: 'deleted' },
];

const STATUS_STYLES: Record<CommentStatus, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  spam: 'bg-red-500/15 text-red-400 border-red-500/20',
  deleted: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState<CommentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const adminKey = () =>
    (typeof window !== 'undefined' && localStorage.getItem('crativo-admin-key')) || '';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/comments${query}`, {
        headers: { 'x-admin-key': adminKey() },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setError('Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: number, status: CommentStatus) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey(),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  const purge = async (id: number) => {
    if (!confirm('Permanently delete this comment and all of its replies?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey() },
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Comments</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Comments post immediately. Clean up anything that should not be here.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white text-sm font-medium">{c.authorName}</span>
                    {c.authorEmail && (
                      <span className="text-zinc-600 text-xs">{c.authorEmail}</span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        STATUS_STYLES[c.status]
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.parentId && (
                      <span className="text-zinc-600 text-xs">reply to #{c.parentId}</span>
                    )}
                  </div>

                  <p className="text-zinc-300 text-sm whitespace-pre-wrap break-words mb-2">
                    {c.body}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-600 flex-wrap">
                    <span>#{c.id}</span>
                    <a
                      href={`/blog/${c.postSlug}#comment-${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {c.postSlug}
                    </a>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                    <span title="Hashed IP - used for rate limiting">
                      ip:{c.ipHash.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {c.status !== 'approved' && (
                    <button
                      disabled={busyId === c.id}
                      onClick={() => updateStatus(c.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs rounded-lg transition-colors disabled:opacity-40"
                    >
                      Approve
                    </button>
                  )}
                  {c.status !== 'spam' && (
                    <button
                      disabled={busyId === c.id}
                      onClick={() => updateStatus(c.id, 'spam')}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-40"
                    >
                      Spam
                    </button>
                  )}
                  {c.status !== 'deleted' && (
                    <button
                      disabled={busyId === c.id}
                      onClick={() => updateStatus(c.id, 'deleted')}
                      title="Hides the text but keeps replies threaded"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors disabled:opacity-40"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    disabled={busyId === c.id}
                    onClick={() => purge(c.id)}
                    title="Deletes this comment and every reply under it"
                    className="px-3 py-1.5 text-zinc-600 hover:text-red-400 text-xs transition-colors disabled:opacity-40"
                  >
                    Purge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
