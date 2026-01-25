import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// In-memory store (in production, use Redis/DB)
interface MessageStore {
  id: string;
  text: string;
  sender: 'user' | 'jose';
  timestamp: Date;
}

interface ConversationData {
  messages: MessageStore[];
  fingerprint: string;
  phoneNumber: string;
  blockedAt?: Date;
}

const conversations = new Map<string, ConversationData>();
const blockedFingerprints = new Set<string>();

export { conversations, blockedFingerprints };

const JOSE_PHONE = '+19105505068';

export async function POST(request: NextRequest) {
  try {
    const { message, phoneNumber, fingerprint } = await request.json();

    if (!message || !phoneNumber) {
      return NextResponse.json(
        { error: 'Message and phone number are required' },
        { status: 400 }
      );
    }

    // Check if fingerprint is blocked
    if (fingerprint && blockedFingerprints.has(fingerprint)) {
      return NextResponse.json({ blocked: true });
    }

    // Initialize or get conversation
    if (!conversations.has(phoneNumber)) {
      conversations.set(phoneNumber, {
        messages: [],
        fingerprint: fingerprint || 'unknown',
        phoneNumber,
      });
    }

    const conv = conversations.get(phoneNumber)!;
    
    // Update fingerprint if newer
    if (fingerprint) {
      conv.fingerprint = fingerprint;
    }

    // Check if this conversation is blocked
    if (conv.blockedAt) {
      return NextResponse.json({ blocked: true });
    }

    // Add message to conversation
    const messageObj: MessageStore = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    conv.messages.push(messageObj);

    // Send SMS to Jose
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Format SMS to Jose with visitor info and fingerprint
    const fpShort = fingerprint ? fingerprint.slice(0, 8) : '????????';
    const smsBody = `📱 crativo.xyz [${fpShort}]\nFrom: ${phoneNumber}\n\n${message.slice(0, 1350)}\n\n💡 Reply "BLOCK" to block this visitor`;

    await client.messages.create({
      body: smsBody,
      from: twilioPhone,
      to: JOSE_PHONE,
    });

    return NextResponse.json({ success: true, messageId: messageObj.id });
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
