import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = neon(process.env.DATABASE_URL);

// Newsletter subscriber operations
export async function addSubscriber(email: string, source = 'website') {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if already subscribed
  const existing = await sql`
    SELECT id, is_subscribed FROM newsletter_subscribers 
    WHERE email = ${normalizedEmail}
  `;
  
  if (existing.length > 0) {
    if (!existing[0].is_subscribed) {
      // Resubscribe
      await sql`
        UPDATE newsletter_subscribers 
        SET is_subscribed = true, unsubscribed_at = NULL, subscribed_at = NOW()
        WHERE email = ${normalizedEmail}
      `;
      return { status: 'resubscribed', email: normalizedEmail };
    }
    return { status: 'already_subscribed', email: normalizedEmail };
  }
  
  // New subscriber
  await sql`
    INSERT INTO newsletter_subscribers (email, source)
    VALUES (${normalizedEmail}, ${source})
  `;
  
  return { status: 'subscribed', email: normalizedEmail };
}

export async function removeSubscriber(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  
  await sql`
    UPDATE newsletter_subscribers 
    SET is_subscribed = false, unsubscribed_at = NOW()
    WHERE email = ${normalizedEmail}
  `;
  
  return { status: 'unsubscribed', email: normalizedEmail };
}

export async function getSubscriberCount() {
  const result = await sql`
    SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_subscribed = true
  `;
  return parseInt(result[0].count, 10);
}

export async function getAllSubscribers() {
  const result = await sql`
    SELECT email, subscribed_at, source 
    FROM newsletter_subscribers 
    WHERE is_subscribed = true
    ORDER BY subscribed_at DESC
  `;
  return result;
}
