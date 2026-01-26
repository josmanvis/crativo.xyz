import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { addSubscriber, getSubscriberCount, getAllSubscribers } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Add to database
    const result = await addSubscriber(email);
    const subscriberCount = await getSubscriberCount();

    console.log(`📧 Newsletter ${result.status}:`, result.email);
    console.log('Total active subscribers:', subscriberCount);

    // Already subscribed - return early with success
    if (result.status === 'already_subscribed') {
      return NextResponse.json(
        { message: 'Already subscribed!' },
        { status: 200 }
      );
    }

    // If Resend is configured, add to contacts and send welcome email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);

        // Try to add to Resend audience (if audience ID is set)
        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (audienceId) {
          await resend.contacts.create({
            audienceId,
            email: result.email,
            unsubscribed: false,
          });
        }

        // Send welcome email
        await resend.emails.send({
          from: 'Jose @ crativo.xyz <newsletter@crativo.xyz>',
          to: result.email,
          subject: 'Welcome to the crativo.xyz newsletter! 🎉',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #fbbf24; margin-bottom: 24px;">Welcome aboard! 👋</h1>
              
              <p style="color: #333; line-height: 1.6; font-size: 16px;">
                Thanks for subscribing to the crativo.xyz newsletter. I'm Jose, a senior software engineer with 21 years of experience building products.
              </p>
              
              <p style="color: #333; line-height: 1.6; font-size: 16px;">
                Here's what you can expect:
              </p>
              
              <ul style="color: #333; line-height: 1.8; font-size: 16px;">
                <li>🛠️ Deep dives on React, TypeScript, and modern web dev</li>
                <li>💡 Lessons from 21 years of shipping software</li>
                <li>🔧 Tools and techniques I actually use</li>
                <li>🎯 Career advice for developers</li>
              </ul>
              
              <p style="color: #333; line-height: 1.6; font-size: 16px;">
                In the meantime, check out some popular articles:
              </p>
              
              <ul style="color: #333; line-height: 1.8; font-size: 16px;">
                <li><a href="https://crativo.xyz/blog/why-nextjs-2025" style="color: #fbbf24;">Why I Still Use Next.js in 2025</a></li>
                <li><a href="https://crativo.xyz/blog/stack-that-ships" style="color: #fbbf24;">The Stack That Actually Ships</a></li>
                <li><a href="https://crativo.xyz/blog/art-of-code-review" style="color: #fbbf24;">The Art of Code Review</a></li>
              </ul>
              
              <p style="color: #333; line-height: 1.6; font-size: 16px; margin-top: 32px;">
                Talk soon,<br>
                <strong>Jose Viscasillas</strong><br>
                <a href="https://crativo.xyz" style="color: #fbbf24;">crativo.xyz</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
              
              <p style="color: #888; font-size: 12px;">
                You're receiving this because you subscribed at crativo.xyz. 
                <a href="https://crativo.xyz/unsubscribe?email=${encodeURIComponent(result.email)}" style="color: #888;">Unsubscribe</a>
              </p>
            </div>
          `,
        });

        console.log('Welcome email sent to:', result.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the subscription if email fails
      }
    }

    // Also notify you about new subscriber
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'crativo.xyz <noreply@crativo.xyz>',
          to: 'viscasillas@me.com',
          subject: `New newsletter subscriber: ${result.email}`,
          html: `<p>New subscriber: <strong>${result.email}</strong></p><p>Status: ${result.status}</p><p>Total active subscribers: ${subscriberCount}</p>`,
        });
      } catch {
        // Ignore notification failures
      }
    }

    return NextResponse.json(
      { message: result.status === 'resubscribed' ? 'Welcome back!' : 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// GET endpoint to view subscribers (admin only)
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';

  if (key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await getSubscriberCount();
    const subscribers = await getAllSubscribers();

    return NextResponse.json({
      count,
      subscribers: subscribers.map(s => ({
        email: s.email,
        subscribedAt: s.subscribed_at,
        source: s.source,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
