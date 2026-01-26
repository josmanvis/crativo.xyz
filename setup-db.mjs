import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4DrlIzjCti6S@ep-royal-flower-ahls19ng-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setup() {
  console.log('Setting up database tables...');

  try {
    // Create carbon_ads table
    await sql`
      CREATE TABLE IF NOT EXISTS carbon_ads (
        id SERIAL PRIMARY KEY,
        image TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        link TEXT NOT NULL,
        sponsor VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created carbon_ads table');

    // Create carbon_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS carbon_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        use_placeholders BOOLEAN DEFAULT true,
        carbon_serve_id VARCHAR(255) DEFAULT '',
        carbon_placement_id VARCHAR(255) DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created carbon_settings table');

    // Insert default settings
    await sql`
      INSERT INTO carbon_settings (id, use_placeholders, carbon_serve_id, carbon_placement_id)
      VALUES (1, true, '', '')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✓ Inserted default settings');

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_carbon_ads_active ON carbon_ads(active) WHERE active = true
    `;
    console.log('✓ Created index');

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();
