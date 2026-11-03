-- Business Accelerator Program content for the Pro Portal, edited from the
-- admin's Dealers → Accelerator Program page. The first admin visit seeds
-- these from src/lib/portal/modules.ts; until then the portal reads that file.
-- Server-only (service role): RLS is on with no policies.

CREATE TABLE IF NOT EXISTS accelerator_program (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS accelerator_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Fixed once created: dealer progress is saved against module/lesson ids.
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position INTEGER NOT NULL DEFAULT 0,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  thumbnail TEXT,
  icon TEXT NOT NULL DEFAULT 'PlayCircle',
  public_href TEXT,
  -- Lesson objects in order (shape: Lesson in src/lib/portal/modules.ts).
  lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_accelerator_modules_position ON accelerator_modules(position);

ALTER TABLE accelerator_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerator_modules ENABLE ROW LEVEL SECURITY;
