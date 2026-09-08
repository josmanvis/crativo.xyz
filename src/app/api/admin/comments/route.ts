export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAllComments } from '@/lib/comments';
import { isAuthorized } from '@/lib/admin-auth';
import { CommentStatus } from '@/types/comment';

const VALID_STATUSES: CommentStatus[] = ['approved', 'pending', 'spam', 'deleted'];

// GET /api/admin/comments[?status=spam] - the moderation queue
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const statusParam = request.nextUrl.searchParams.get('status');
    const status =
      statusParam && VALID_STATUSES.includes(statusParam as CommentStatus)
        ? (statusParam as CommentStatus)
        : undefined;

    const comments = await getAllComments(status);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
