'use client';

import { useCallback, useEffect, useState } from 'react';
import { CommentNode } from '@/types/comment';
import CommentForm from './CommentForm';
import CommentThread from './CommentThread';

function countAll(nodes: CommentNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + (node.status === 'deleted' ? 0 : 1) + countAll(node.replies),
    0
  );
}

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setComments(data.comments || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const total = countAll(comments);

  return (
    <section
      id="comments"
      className="scroll-mt-[calc(var(--nav-h)+24px)]"
      data-hud-section={`Discussion · ${total} ${total === 1 ? 'comment' : 'comments'}`}
    >
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>Discussion · {total}</span>
        <span className="hidden sm:inline">Be nice, or be funny. Preferably both.</span>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>
      <h2 className="t-h2 mt-6 mb-8">Talk back.</h2>

      <div className="mb-10">
        <CommentForm slug={slug} onPosted={load} />
      </div>

      {state === 'loading' && (
        <div className="space-y-5" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 bg-paper-2 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-paper-2 w-32" />
                <div className="h-3 bg-paper-2 w-full" />
                <div className="h-3 bg-paper-2 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="text-center py-8">
          <p className="text-graphite text-sm mb-3">Could not load the discussion.</p>
          <button
            onClick={() => {
              setState('loading');
              load();
            }}
            className="btn"
          >
            Try again
          </button>
        </div>
      )}

      {state === 'ready' && comments.length === 0 && (
        <p className="text-graphite py-4">
          No comments yet. Be the first to say something.
        </p>
      )}

      {state === 'ready' && comments.length > 0 && (
        <div className="space-y-8">
          {comments.map((node) => (
            <CommentThread key={node.id} node={node} slug={slug} onPosted={load} />
          ))}
        </div>
      )}
    </section>
  );
}
