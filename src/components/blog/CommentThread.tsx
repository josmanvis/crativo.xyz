'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CommentNode, MAX_THREAD_DEPTH } from '@/types/comment';
import CommentForm from './CommentForm';

/** "3 hours ago" reads better than a timestamp on a discussion thread. */
function relativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
    [2592000, 'month'],
    [31536000, 'year'],
  ];

  let divisor = 1;
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  for (const [threshold, candidate] of units) {
    if (seconds < threshold) break;
    divisor = threshold;
    unit = candidate;
  }

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return formatter.format(-Math.floor(seconds / divisor), unit);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Deterministic avatar tint so the same commenter looks the same every time. */
function avatarGradient(name: string): string {
  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-fuchsia-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function Avatar({ name, avatarHash }: { name: string; avatarHash: string }) {
  if (avatarHash) {
    return (
      <Image
        src={`https://www.gravatar.com/avatar/${avatarHash}?s=80&d=blank`}
        alt=""
        width={36}
        height={36}
        unoptimized
        className={`w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br ${avatarGradient(name)}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br ${avatarGradient(
        name
      )} flex items-center justify-center text-white text-xs font-bold`}
    >
      {initials(name)}
    </div>
  );
}

function countReplies(node: CommentNode): number {
  return node.replies.reduce((total, reply) => total + 1 + countReplies(reply), 0);
}

interface CommentThreadProps {
  node: CommentNode;
  slug: string;
  onPosted: () => void;
}

export default function CommentThread({ node, slug, onPosted }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const replyCount = countReplies(node);
  const isTombstone = node.status === 'deleted';

  const handlePosted = () => {
    setIsReplying(false);
    onPosted();
  };

  return (
    <article id={`comment-${node.id}`} className="scroll-mt-24">
      <div className="flex gap-3">
        {isTombstone ? (
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-full flex-shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs"
          >
            ×
          </div>
        ) : (
          <Avatar name={node.authorName} avatarHash={node.avatarHash} />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isTombstone ? (
              <span className="text-zinc-600 text-sm italic">Comment removed</span>
            ) : (
              <>
                <span className="text-white text-sm font-medium">{node.authorName}</span>
                {node.isAuthor && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Author
                  </span>
                )}
              </>
            )}
            <time
              dateTime={node.createdAt}
              title={new Date(node.createdAt).toLocaleString()}
              className="text-zinc-600 text-xs"
            >
              {relativeTime(node.createdAt)}
            </time>
          </div>

          {!isTombstone && (
            <p className="mt-1.5 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {node.body}
            </p>
          )}

          <div className="mt-2 flex items-center gap-4">
            {!isTombstone && (
              <button
                onClick={() => setIsReplying((v) => !v)}
                className="text-zinc-500 hover:text-emerald-400 text-xs font-medium transition-colors"
              >
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            )}
            {replyCount > 0 && (
              <button
                onClick={() => setIsCollapsed((v) => !v)}
                className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
              >
                {isCollapsed
                  ? `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                  : 'Hide replies'}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4">
              <CommentForm
                slug={slug}
                parentId={node.id}
                replyingTo={isTombstone ? undefined : node.authorName}
                onPosted={handlePosted}
                onCancel={() => setIsReplying(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {node.replies.length > 0 && !isCollapsed && (
        <div
          className={`mt-5 space-y-5 border-l border-white/10 ${
            // Past the depth cap we stop indenting so deep threads stay readable on mobile.
            node.depth >= MAX_THREAD_DEPTH - 1 ? 'pl-3 ml-1' : 'pl-4 ml-4'
          }`}
        >
          {node.replies.map((reply) => (
            <CommentThread key={reply.id} node={reply} slug={slug} onPosted={onPosted} />
          ))}
        </div>
      )}
    </article>
  );
}
