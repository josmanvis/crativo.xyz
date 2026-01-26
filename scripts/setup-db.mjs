import { neon } from '@neondatabase/serverless';

// Connection string with c-3 region (required for this Neon project)
const DATABASE_URL = 'postgresql://neondb_owner:npg_4DrlIzjCti6S@ep-royal-flower-ahls19ng-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function setup() {
  console.log('Creating newsletter_subscribers table...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP WITH TIME ZONE,
      is_subscribed BOOLEAN DEFAULT true,
      source VARCHAR(100) DEFAULT 'website'
    )
  `;
  
  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_active ON newsletter_subscribers(is_subscribed) WHERE is_subscribed = true`;
  
  console.log('✅ Table created successfully!');
  
  const result = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers`;
  console.log('Current subscriber count:', result[0].count);
}

setup().catch(console.error);
