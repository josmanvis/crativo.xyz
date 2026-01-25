import { NextRequest, NextResponse } from 'next/server';
import { conversations } from '../send/route';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID required' },
      { status: 400 }
    );
  }

  const messages = conversations.get(conversationId) || [];

  return NextResponse.json({ messages });
}
