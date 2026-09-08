-- Carbon Ads Schema for Neon PostgreSQL
-- Run this to set up the carbon ads tables

-- Carbon Ads table
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
);

-- Carbon Settings table (single row)
CREATE TABLE IF NOT EXISTS carbon_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  use_placeholders BOOLEAN DEFAULT true,
  carbon_serve_id VARCHAR(255) DEFAULT '',
  carbon_placement_id VARCHAR(255) DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO carbon_settings (id, use_placeholders, carbon_serve_id, carbon_placement_id)
VALUES (1, true, '', '')
ON CONFLICT (id) DO NOTHING;

-- Index for active ads lookup
CREATE INDEX IF NOT EXISTS idx_carbon_ads_active ON carbon_ads(active) WHERE active = true;

-- =====================================
-- Blog Comments (threaded)
-- =====================================

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
);

-- Public thread lookup: every post page hits this.
CREATE INDEX IF NOT EXISTS idx_blog_comments_post
  ON blog_comments(post_slug, created_at);

-- Reply resolution when building the tree.
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent
  ON blog_comments(parent_id);

-- Rate limiting looks up recent comments by IP hash.
CREATE INDEX IF NOT EXISTS idx_blog_comments_rate_limit
  ON blog_comments(ip_hash, created_at);
