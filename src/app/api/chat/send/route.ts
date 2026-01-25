import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// In-memory store for conversations (in production, use a database)
const conversations = new Map<string, Array<{ id: string; text: string; sender: 'user' | 'jose'; timestamp: Date }>>();

export { conversations };

const JOSE_PHONE = '+19105505068';

export async function POST(request: NextRequest) {
  try {
    const { message, phoneNumber } = await request.json();

    if (!message || !phoneNumber) {
      return NextResponse.json(
        { error: 'Message and phone number are required' },
        { status: 400 }
      );
    }

    // Initialize conversation if needed
    if (!conversations.has(phoneNumber)) {
      conversations.set(phoneNumber, []);
    }

    // Add message to conversation
    const messageObj = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    conversations.get(phoneNumber)!.push(messageObj);

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

    // Format SMS to Jose with visitor info
    const smsBody = `📱 crativo.xyz\nFrom: ${phoneNumber}\n\n${message.slice(0, 1400)}`;

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
