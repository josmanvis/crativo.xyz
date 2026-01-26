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

// =====================================
// Carbon Ads Management
// =====================================

export interface CarbonAd {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sponsor: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CarbonSettings {
  use_placeholders: boolean;
  carbon_serve_id: string;
  carbon_placement_id: string;
}

export async function getAds(): Promise<CarbonAd[]> {
  const result = await sql`
    SELECT id, image, title, description, link, sponsor, active, created_at, updated_at
    FROM carbon_ads
    ORDER BY created_at DESC
  `;
  return result as CarbonAd[];
}

export async function getActiveAds(): Promise<CarbonAd[]> {
  const result = await sql`
    SELECT id, image, title, description, link, sponsor, active, created_at, updated_at
    FROM carbon_ads
    WHERE active = true
    ORDER BY RANDOM()
    LIMIT 10
  `;
  return result as CarbonAd[];
}

export async function getAdById(id: string): Promise<CarbonAd | null> {
  const result = await sql`
    SELECT id, image, title, description, link, sponsor, active, created_at, updated_at
    FROM carbon_ads
    WHERE id = ${id}
  `;
  return result.length > 0 ? result[0] as CarbonAd : null;
}

export async function createAd(ad: Omit<CarbonAd, 'id' | 'created_at' | 'updated_at'>): Promise<CarbonAd> {
  const result = await sql`
    INSERT INTO carbon_ads (image, title, description, link, sponsor, active)
    VALUES (${ad.image}, ${ad.title}, ${ad.description}, ${ad.link}, ${ad.sponsor}, ${ad.active})
    RETURNING id, image, title, description, link, sponsor, active, created_at, updated_at
  `;
  return result[0] as CarbonAd;
}

export async function updateAd(id: string, ad: Partial<Omit<CarbonAd, 'id' | 'created_at' | 'updated_at'>>): Promise<CarbonAd | null> {
  const fields: string[] = [];
  const values: (string | boolean)[] = [];
  
  if (ad.image !== undefined) { fields.push('image'); values.push(ad.image); }
  if (ad.title !== undefined) { fields.push('title'); values.push(ad.title); }
  if (ad.description !== undefined) { fields.push('description'); values.push(ad.description); }
  if (ad.link !== undefined) { fields.push('link'); values.push(ad.link); }
  if (ad.sponsor !== undefined) { fields.push('sponsor'); values.push(ad.sponsor); }
  if (ad.active !== undefined) { fields.push('active'); values.push(ad.active); }
  
  if (fields.length === 0) return getAdById(id);
  
  // Build dynamic update query
  const result = await sql`
    UPDATE carbon_ads
    SET 
      image = COALESCE(${ad.image ?? null}, image),
      title = COALESCE(${ad.title ?? null}, title),
      description = COALESCE(${ad.description ?? null}, description),
      link = COALESCE(${ad.link ?? null}, link),
      sponsor = COALESCE(${ad.sponsor ?? null}, sponsor),
      active = COALESCE(${ad.active ?? null}, active),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, image, title, description, link, sponsor, active, created_at, updated_at
  `;
  return result.length > 0 ? result[0] as CarbonAd : null;
}

export async function deleteAd(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM carbon_ads
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

export async function toggleAdActive(id: string): Promise<CarbonAd | null> {
  const result = await sql`
    UPDATE carbon_ads
    SET active = NOT active, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, image, title, description, link, sponsor, active, created_at, updated_at
  `;
  return result.length > 0 ? result[0] as CarbonAd : null;
}

export async function getCarbonSettings(): Promise<CarbonSettings> {
  const result = await sql`
    SELECT use_placeholders, carbon_serve_id, carbon_placement_id
    FROM carbon_settings
    WHERE id = 1
  `;
  if (result.length === 0) {
    return { use_placeholders: true, carbon_serve_id: '', carbon_placement_id: '' };
  }
  return result[0] as CarbonSettings;
}

export async function updateCarbonSettings(settings: Partial<CarbonSettings>): Promise<CarbonSettings> {
  const result = await sql`
    INSERT INTO carbon_settings (id, use_placeholders, carbon_serve_id, carbon_placement_id)
    VALUES (1, ${settings.use_placeholders ?? true}, ${settings.carbon_serve_id ?? ''}, ${settings.carbon_placement_id ?? ''})
    ON CONFLICT (id) DO UPDATE SET
      use_placeholders = COALESCE(${settings.use_placeholders ?? null}, carbon_settings.use_placeholders),
      carbon_serve_id = COALESCE(${settings.carbon_serve_id ?? null}, carbon_settings.carbon_serve_id),
      carbon_placement_id = COALESCE(${settings.carbon_placement_id ?? null}, carbon_settings.carbon_placement_id),
      updated_at = NOW()
    RETURNING use_placeholders, carbon_serve_id, carbon_placement_id
  `;
  return result[0] as CarbonSettings;
}
