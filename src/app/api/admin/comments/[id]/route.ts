export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { purgeComment, setCommentStatus } from '@/lib/comments';
import { CommentStatus } from '@/types/comment';
import { isAuthorized } from '@/lib/admin-auth';

const VALID_STATUSES: CommentStatus[] = ['approved', 'pending', 'spam', 'deleted'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/comments/:id - change a comment's status
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const comment = await setCommentStatus(id, status);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/admin/comments/:id - permanently remove a comment and its replies
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
  }

  try {
    const deleted = await purgeComment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
