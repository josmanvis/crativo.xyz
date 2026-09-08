export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  CommentError,
  createComment,
  getCommentsForPost,
  hashIp,
  isDuplicateComment,
  getRecentCommentCount,
  normalizeEmail,
} from '@/lib/comments';
import { MAX_BODY_LENGTH, MAX_NAME_LENGTH } from '@/types/comment';

/** Comments allowed per IP per minute. */
const RATE_LIMIT = 3;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

/** The site owner's replies get an "Author" badge. */
function isSiteAuthor(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';
  return request.headers.get('x-admin-key') === adminKey;
}

// GET /api/comments?slug=my-post - the public thread for a post
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'A slug is required' }, { status: 400 });
  }

  try {
    const comments = await getCommentsForPost(slug);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

// POST /api/comments - leave a comment or a reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, parentId, author, email, content, website } = body;

    // `website` is a honeypot: real users never see it, bots fill it in.
    // Pretend it worked so the bot has nothing to tune against.
    if (website) {
      return NextResponse.json({ message: 'Comment posted' }, { status: 201 });
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'A slug is required' }, { status: 400 });
    }
    if (!author || typeof author !== 'string' || !author.trim()) {
      return NextResponse.json({ error: 'Please add your name' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Please write a comment' }, { status: 400 });
    }
    if (content.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Comments are limited to ${MAX_BODY_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (author.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Names are limited to ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    let parent: number | null = null;
    if (parentId != null) {
      parent = Number(parentId);
      if (!Number.isInteger(parent) || parent < 1) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 });
      }
    }

    const ipHash = hashIp(clientIp(request));

    if ((await getRecentCommentCount(ipHash)) >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'You are commenting a little fast. Give it a minute.' },
        { status: 429 }
      );
    }

    if (await isDuplicateComment(ipHash, content.trim())) {
      return NextResponse.json(
        { error: 'Looks like you already posted that one.' },
        { status: 409 }
      );
    }

    const comment = await createComment({
      postSlug: slug,
      parentId: parent,
      authorName: author,
      authorEmail: normalizeEmail(email),
      body: content,
      isAuthor: isSiteAuthor(request),
      ipHash,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof CommentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
