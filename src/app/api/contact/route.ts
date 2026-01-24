import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '@/types/contact';

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // For v1: Log to console (placeholder for email service integration)
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@crativo.xyz',
    //   to: 'hello@crativo.xyz',
    //   subject: `Contact Form: ${data.subject}`,
    //   text: `From: ${data.name} (${data.email})\n\n${data.message}`,
    // });

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
