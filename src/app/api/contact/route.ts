import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';

interface ContactFormData {
  name?: string;
  email: string;
  message: string;
  fingerprint?: string;
}

// In-memory store for messages (in production, use a database)
interface StoredMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  fingerprint: string;
  timestamp: Date;
  blocked?: boolean;
}

const messages: StoredMessage[] = [];
const blockedFingerprints = new Set<string>();

export { messages, blockedFingerprints };

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.email || !data.message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if fingerprint is blocked
    if (data.fingerprint && blockedFingerprints.has(data.fingerprint)) {
      return NextResponse.json({ blocked: true });
    }

    // Store the message
    const storedMessage: StoredMessage = {
      id: Date.now().toString(),
      name: data.name || 'Anonymous',
      email: data.email,
      message: data.message,
      fingerprint: data.fingerprint || 'unknown',
      timestamp: new Date(),
    };
    messages.push(storedMessage);

    console.log('📬 New contact message:', {
      name: storedMessage.name,
      email: storedMessage.email,
      fingerprint: storedMessage.fingerprint.slice(0, 8),
      preview: storedMessage.message.slice(0, 100),
      timestamp: storedMessage.timestamp.toISOString(),
    });

    // Try to send email notification if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'crativo.xyz <noreply@crativo.xyz>',
          to: 'viscasillas@me.com',
          subject: `New message from ${storedMessage.name}`,
          html: `
            <h2>New Contact Form Message</h2>
            <p><strong>From:</strong> ${storedMessage.name} (${storedMessage.email})</p>
            <p><strong>Fingerprint:</strong> ${storedMessage.fingerprint.slice(0, 8)}</p>
            <hr>
            <p>${storedMessage.message.replace(/\n/g, '<br>')}</p>
          `,
        });
        console.log('Email notification sent');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Try to send SMS notification if Twilio is configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const twilioTo = process.env.NOTIFY_PHONE_NUMBER;

    if (twilioSid && twilioAuth && twilioFrom && twilioTo) {
      try {
        const client = twilio(twilioSid, twilioAuth);
        const smsBody = `📬 crativo.xyz\nFrom: ${storedMessage.name}\nEmail: ${storedMessage.email}\n\n${storedMessage.message.slice(0, 300)}${storedMessage.message.length > 300 ? '...' : ''}`;
        
        await client.messages.create({
          body: smsBody,
          from: twilioFrom,
          to: twilioTo,
        });
        console.log('SMS notification sent');
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json(
      { message: 'Message sent successfully', id: storedMessage.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET endpoint to view messages (simple admin)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const key = searchParams.get('key');

  // Simple auth check
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';
  if (key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'block') {
    const fp = searchParams.get('fp');
    if (fp) {
      blockedFingerprints.add(fp);
      return NextResponse.json({ blocked: fp });
    }
  }

  return NextResponse.json({
    messages: messages.slice(-50).reverse(),
    blocked: Array.from(blockedFingerprints),
  });
}
