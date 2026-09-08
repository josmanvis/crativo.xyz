import { createHash } from 'crypto';
import { sql } from './db';
import {
  AdminComment,
  Comment,
  CommentNode,
  CommentStatus,
  MAX_BODY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_THREAD_DEPTH,
  NewCommentInput,
} from '@/types/comment';

// =====================================
// Hashing helpers
// =====================================

function salt() {
  return process.env.COMMENTS_SALT || process.env.ADMIN_KEY || 'crativo-comments';
}

/** Hash a client IP so we can rate limit and block without storing the address. */
export function hashIp(ip: string): string {
  return createHash('sha256').update(`${salt()}:${ip}`).digest('hex').slice(0, 32);
}

/** Gravatar uses MD5 of the lowercased, trimmed email. */
function gravatarHash(email: string | null): string {
  if (!email) return '';
  return createHash('md5').update(email.toLowerCase().trim()).digest('hex');
}

// =====================================
// Input sanitising
// =====================================

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Strip tags and control characters, collapse runaway blank lines, enforce length. */
export function sanitizeBody(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(CONTROL_CHARS, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_BODY_LENGTH);
}

export function sanitizeName(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(CONTROL_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const email = raw.toLowerCase().trim();
  return EMAIL_RE.test(email) ? email : null;
}

// =====================================
// Row mapping
// =====================================

interface CommentRow {
  id: number;
  post_slug: string;
  parent_id: number | null;
  depth: number;
  author_name: string;
  author_email: string | null;
  body: string;
  is_author: boolean;
  status: CommentStatus;
  ip_hash: string;
  created_at: string | Date;
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postSlug: row.post_slug,
    parentId: row.parent_id,
    depth: row.depth,
    authorName: row.author_name,
    avatarHash: gravatarHash(row.author_email),
    // A tombstoned comment keeps its place in the thread but loses its content.
    body: row.status === 'deleted' ? '' : row.body,
    isAuthor: row.is_author,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function toAdminComment(row: CommentRow): AdminComment {
  return {
    ...toComment(row),
    body: row.body,
    authorEmail: row.author_email,
    ipHash: row.ip_hash,
  };
}

// =====================================
// Tree building
// =====================================

/**
 * Turn a flat, chronologically ordered list into a reply tree.
 * Orphans (parent was hard-deleted) are promoted to top level so they
 * never silently vanish from the thread.
 */
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const byId = new Map<number, CommentNode>();
  for (const c of comments) {
    byId.set(c.id, { ...c, replies: [] });
  }

  const roots: CommentNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId != null ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return pruneEmptyTombstones(roots);
}

/** A deleted comment with no surviving replies has nothing left to anchor - drop it. */
function pruneEmptyTombstones(nodes: CommentNode[]): CommentNode[] {
  const kept: CommentNode[] = [];
  for (const node of nodes) {
    node.replies = pruneEmptyTombstones(node.replies);
    if (node.status === 'deleted' && node.replies.length === 0) continue;
    kept.push(node);
  }
  return kept;
}

// =====================================
// Reads
// =====================================

/** Public thread for a post: approved comments plus tombstones holding replies together. */
export async function getCommentsForPost(postSlug: string): Promise<CommentNode[]> {
  const rows = (await sql`
    SELECT id, post_slug, parent_id, depth, author_name, author_email,
           body, is_author, status, ip_hash, created_at
    FROM blog_comments
    WHERE post_slug = ${postSlug}
      AND status IN ('approved', 'deleted')
    ORDER BY created_at ASC
  `) as CommentRow[];

  return buildCommentTree(rows.map(toComment));
}

export async function getCommentCount(postSlug: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) AS count
    FROM blog_comments
    WHERE post_slug = ${postSlug} AND status = 'approved'
  `;
  return parseInt(result[0]?.count ?? '0', 10);
}

/** Moderation queue. Pass a status to filter, or omit for everything. */
export async function getAllComments(status?: CommentStatus): Promise<AdminComment[]> {
  const rows = (status
    ? await sql`
        SELECT id, post_slug, parent_id, depth, author_name, author_email,
               body, is_author, status, ip_hash, created_at
        FROM blog_comments
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 500
      `
    : await sql`
        SELECT id, post_slug, parent_id, depth, author_name, author_email,
               body, is_author, status, ip_hash, created_at
        FROM blog_comments
        ORDER BY created_at DESC
        LIMIT 500
      `) as CommentRow[];

  return rows.map(toAdminComment);
}

async function getCommentRow(id: number): Promise<CommentRow | null> {
  const rows = (await sql`
    SELECT id, post_slug, parent_id, depth, author_name, author_email,
           body, is_author, status, ip_hash, created_at
    FROM blog_comments
    WHERE id = ${id}
  `) as CommentRow[];
  return rows[0] ?? null;
}

// =====================================
// Writes
// =====================================

/** How many comments this IP has posted in the last minute. */
export async function getRecentCommentCount(ipHash: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) AS count
    FROM blog_comments
    WHERE ip_hash = ${ipHash}
      AND created_at > NOW() - INTERVAL '1 minute'
  `;
  return parseInt(result[0]?.count ?? '0', 10);
}

/** True when this IP already posted this exact text - catches double submits. */
export async function isDuplicateComment(ipHash: string, body: string): Promise<boolean> {
  const result = await sql`
    SELECT 1
    FROM blog_comments
    WHERE ip_hash = ${ipHash}
      AND body = ${body}
      AND created_at > NOW() - INTERVAL '1 hour'
    LIMIT 1
  `;
  return result.length > 0;
}

export class CommentError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CommentError';
    this.status = status;
  }
}

export async function createComment(input: NewCommentInput): Promise<Comment> {
  const authorName = sanitizeName(input.authorName);
  const body = sanitizeBody(input.body);

  if (!authorName) throw new CommentError('A name is required');
  if (!body) throw new CommentError('A comment is required');

  let depth = 0;
  let parentId: number | null = null;

  if (input.parentId != null) {
    const parent = await getCommentRow(input.parentId);
    if (!parent) throw new CommentError('The comment you replied to no longer exists', 404);
    if (parent.post_slug !== input.postSlug) {
      throw new CommentError('That reply belongs to a different post');
    }
    parentId = parent.id;
    // Past the visual limit we keep threading in the data but stop indenting.
    depth = Math.min(parent.depth + 1, MAX_THREAD_DEPTH);
  }

  const rows = (await sql`
    INSERT INTO blog_comments
      (post_slug, parent_id, depth, author_name, author_email, body, is_author, status, ip_hash)
    VALUES (
      ${input.postSlug}, ${parentId}, ${depth}, ${authorName},
      ${input.authorEmail ?? null}, ${body}, ${input.isAuthor ?? false},
      'approved', ${input.ipHash}
    )
    RETURNING id, post_slug, parent_id, depth, author_name, author_email,
              body, is_author, status, ip_hash, created_at
  `) as CommentRow[];

  return toComment(rows[0]);
}

export async function setCommentStatus(
  id: number,
  status: CommentStatus
): Promise<AdminComment | null> {
  const rows = (await sql`
    UPDATE blog_comments
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, post_slug, parent_id, depth, author_name, author_email,
              body, is_author, status, ip_hash, created_at
  `) as CommentRow[];
  return rows.length > 0 ? toAdminComment(rows[0]) : null;
}

/** Permanently remove a comment and everything below it. */
export async function purgeComment(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM blog_comments WHERE id = ${id} RETURNING id
  `;
  return result.length > 0;
}
