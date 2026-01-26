import { NextRequest, NextResponse } from 'next/server';
import { removeSubscriber } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await removeSubscriber(email);
    console.log('📧 Newsletter unsubscribed:', result.email);

    return NextResponse.json(
      { message: 'Successfully unsubscribed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// Also support GET for unsubscribe links
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  try {
    await removeSubscriber(email);
    
    // Return a simple HTML page confirming unsubscribe
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed - crativo.xyz</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; background: #111; color: #fff; }
            h1 { color: #fbbf24; }
            a { color: #fbbf24; }
          </style>
        </head>
        <body>
          <h1>You've been unsubscribed</h1>
          <p>Sorry to see you go! You won't receive any more emails from crativo.xyz.</p>
          <p><a href="https://crativo.xyz">Back to crativo.xyz</a></p>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
