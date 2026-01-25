import { NextRequest, NextResponse } from 'next/server';
import { conversations, blockedFingerprints } from '../send/route';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');
  const fingerprint = searchParams.get('fp');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID required' },
      { status: 400 }
    );
  }

  // Check if fingerprint is blocked
  if (fingerprint && blockedFingerprints.has(fingerprint)) {
    return NextResponse.json({ blocked: true, messages: [] });
  }

  const conv = conversations.get(conversationId);
  
  if (!conv) {
    return NextResponse.json({ messages: [] });
  }

  // Check if conversation is blocked
  if (conv.blockedAt) {
    return NextResponse.json({ blocked: true, messages: [] });
  }

  return NextResponse.json({ messages: conv.messages });
}
