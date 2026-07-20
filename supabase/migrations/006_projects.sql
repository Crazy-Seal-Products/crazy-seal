-- Customer project showcase (replaces WordPress "project" post type)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number INTEGER,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,                     -- "Built to Outlast the Build"
  category TEXT,                           -- rv | commercial | residential | transportation | direct-to-deck
  project_type TEXT,                       -- "RV Roof - Self-Installed DIY Restoration"
  products_used TEXT,                      -- "Crazy Seal Direct-to-Deck Kit"
  customer_type TEXT,                      -- "Self-Installed (DIY)"
  location TEXT,
  spotlight_title TEXT,                    -- "Project Spotlight: Better Than Factory"
  story JSONB DEFAULT '[]',                -- [{ "heading": "...", "body": "..." }]
  quote TEXT,
  photo_urls JSONB DEFAULT '[]',           -- media.crazyseal.com URLs, display order
  cover_photo TEXT,
  published BOOLEAN DEFAULT TRUE,
  wp_url TEXT,                             -- original crazyseal.com/project/... URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_published ON projects(published, project_number DESC);
CREATE UNIQUE INDEX idx_projects_number ON projects(project_number) WHERE project_number IS NOT NULL;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects" ON projects
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Authenticated can manage projects" ON projects
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
