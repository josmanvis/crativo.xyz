/**
 * Creates the blog_comments table. Safe to re-run.
 *
 *   DATABASE_URL="postgresql://..." node scripts/setup-comments-db.mjs
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required. Set it before running this script.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setup() {
  console.log('Setting up blog comments...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        post_slug VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
        depth INTEGER NOT NULL DEFAULT 0,
        author_name VARCHAR(60) NOT NULL,
        author_email VARCHAR(255),
        body TEXT NOT NULL,
        is_author BOOLEAN NOT NULL DEFAULT false,
        status VARCHAR(16) NOT NULL DEFAULT 'approved'
          CHECK (status IN ('approved', 'pending', 'spam', 'deleted')),
        ip_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created blog_comments table');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_comments_post
        ON blog_comments(post_slug, created_at)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_comments_parent
        ON blog_comments(parent_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_comments_rate_limit
        ON blog_comments(ip_hash, created_at)
    `;
    console.log('✓ Created indexes');

    console.log('\n✅ Comments setup complete!');
  } catch (error) {
    console.error('Comments setup failed:', error);
    process.exit(1);
  }
}

setup();
