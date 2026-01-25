import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { conversations, blockedFingerprints } from '../send/route';

const JOSE_PHONE = '+19105505068';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio webhook
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const to = formData.get('To') as string;

    console.log('Webhook received:', { from, to, body: body?.slice(0, 50) });

    // Check if this is from Jose
    if (from === JOSE_PHONE) {
      const trimmedBody = body.trim().toUpperCase();
      
      // Handle BLOCK command
      if (trimmedBody === 'BLOCK') {
        // Find the most recent conversation and block it
        const recentConversation = Array.from(conversations.entries())
          .filter(([_, conv]) => conv.messages.length > 0 && !conv.blockedAt)
          .sort((a, b) => {
            const aLast = a[1].messages[a[1].messages.length - 1]?.timestamp || new Date(0);
            const bLast = b[1].messages[b[1].messages.length - 1]?.timestamp || new Date(0);
            return new Date(bLast).getTime() - new Date(aLast).getTime();
          })[0];

        if (recentConversation) {
          const [phoneNumber, conv] = recentConversation;
          conv.blockedAt = new Date();
          
          // Also block the fingerprint
          if (conv.fingerprint && conv.fingerprint !== 'unknown') {
            blockedFingerprints.add(conv.fingerprint);
          }

          // Send confirmation to Jose
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

          if (accountSid && authToken && twilioPhone) {
            const client = twilio(accountSid, authToken);
            await client.messages.create({
              body: `✅ Blocked ${phoneNumber} [${conv.fingerprint?.slice(0, 8)}]`,
              from: twilioPhone,
              to: JOSE_PHONE,
            });
          }
        }

        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        );
      }

      // Jose is replying to a visitor
      // Try to parse recipient phone from message (e.g., "9105551234 Hey thanks!")
      const phoneMatch = body.match(/^(\+?1?\d{10})\s+([\s\S]+)$/);
      
      let targetPhone: string;
      let messageText: string;

      if (phoneMatch) {
        // Jose included the phone number
        let phone = phoneMatch[1].replace(/\D/g, '');
        if (phone.length === 10) phone = '+1' + phone;
        else if (phone.length === 11 && phone.startsWith('1')) phone = '+' + phone;
        targetPhone = phone;
        messageText = phoneMatch[2];
      } else {
        // Find the most recent active conversation
        const recentConversation = Array.from(conversations.entries())
          .filter(([_, conv]) => conv.messages.length > 0 && !conv.blockedAt)
          .sort((a, b) => {
            const aLast = a[1].messages[a[1].messages.length - 1]?.timestamp || new Date(0);
            const bLast = b[1].messages[b[1].messages.length - 1]?.timestamp || new Date(0);
            return new Date(bLast).getTime() - new Date(aLast).getTime();
          })[0];

        if (!recentConversation) {
          return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            { headers: { 'Content-Type': 'text/xml' } }
          );
        }

        targetPhone = recentConversation[0];
        messageText = body;
      }

      // Get conversation
      const conv = conversations.get(targetPhone);
      if (!conv || conv.blockedAt) {
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        );
      }

      // Add Jose's reply to the conversation
      conv.messages.push({
        id: Date.now().toString(),
        text: messageText,
        sender: 'jose',
        timestamp: new Date(),
      });

      // Send SMS to the visitor
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone) {
        const client = twilio(accountSid, authToken);
        
        try {
          await client.messages.create({
            body: messageText,
            from: twilioPhone,
            to: targetPhone,
          });
          console.log('Reply sent to:', targetPhone);
        } catch (smsError) {
          console.error('Failed to send reply SMS:', smsError);
        }
      }
    } else {
      // This is from a visitor (incoming to the Twilio number)
      // Check if this number is blocked
      const existingConv = conversations.get(from);
      if (existingConv?.blockedAt) {
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        );
      }

      // Add to conversation
      if (!conversations.has(from)) {
        conversations.set(from, {
          messages: [],
          fingerprint: 'sms-only',
          phoneNumber: from,
        });
      }

      conversations.get(from)!.messages.push({
        id: Date.now().toString(),
        text: body,
        sender: 'user',
        timestamp: new Date(),
      });

      // Forward to Jose
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone) {
        const client = twilio(accountSid, authToken);
        
        await client.messages.create({
          body: `📱 crativo.xyz [sms-only]\nFrom: ${from}\n\n${body}\n\n💡 Reply "BLOCK" to block`,
          from: twilioPhone,
          to: JOSE_PHONE,
        });
      }
    }

    // Return TwiML response (empty, no auto-reply)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

// Handle GET for Twilio webhook verification
export async function GET() {
  return new NextResponse('Webhook active', { status: 200 });
}
