import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

interface ContactFormData {
  name?: string;
  email: string;
  subject?: string;
  message: string;
}

const JOSE_PHONE = '+19105505068';

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

    // Send SMS via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Twilio credentials not configured');
      // Fall back to just logging if Twilio not configured
      console.log('Contact form submission:', {
        email: data.email,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: 'Message received (SMS not configured)' },
        { status: 200 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Format the SMS message
    const smsBody = `📬 crativo.xyz\n\nFrom: ${data.email}\n\n${data.message.slice(0, 1400)}`;

    await client.messages.create({
      body: smsBody,
      from: twilioPhone,
      to: JOSE_PHONE,
    });

    console.log('SMS sent successfully to', JOSE_PHONE);

    return NextResponse.json(
      { message: 'Message sent successfully' },
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
