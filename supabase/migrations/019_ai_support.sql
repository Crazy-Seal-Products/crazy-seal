-- AI assistants and support desk. Add-only: new tables and one search
-- function, no changes to existing tables.
--
--   ai_knowledge       what the assistants answer from (site pages + staff notes)
--   ai_conversations   one chat with an assistant (customer site chat, dealer
--                      Support tab, staff Assistant)
--   ai_messages        every turn, with sources, tool calls, timing and cost
--   support_tickets    the review queue: customer hand-offs, auto-flagged and
--                      sampled chats, dealer support requests, feedback and
--                      feature requests
--   support_messages   the thread on a ticket (replies and internal notes)
--   support_reviewers  staff who own the queue (assignment + email alerts)
--   ai_eval_cases      test questions saved from fixed tickets
--
-- Written by the server with the service role only; RLS is on with no
-- policies, so no browser client can read or write these tables.

-- ─── Knowledge ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- page: chunk of a crazyseal.com page (replaced on each refresh)
  -- note: written by staff in the admin (kept until edited or switched off)
  source TEXT NOT NULL CHECK (source IN ('page', 'note')),
  -- all: every assistant. dealer: only the Pro Hub and staff assistants.
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'dealer')),
  url TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  search TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) STORED,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_search ON ai_knowledge USING GIN (search);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_source ON ai_knowledge (source, url);
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;

-- Ranked keyword search. Any word can match (OR), so a whole question still
-- finds the chunks that share its important words; titles weigh more.
CREATE OR REPLACE FUNCTION ai_search_knowledge(q TEXT, include_dealer BOOLEAN, max_rows INTEGER DEFAULT 6)
RETURNS TABLE (id UUID, source TEXT, url TEXT, title TEXT, body TEXT, rank REAL)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH query AS (
    SELECT NULLIF(replace(plainto_tsquery('english', q)::text, '&', '|'), '')::tsquery AS tsq
  )
  SELECT k.id, k.source, k.url, k.title, k.body, ts_rank_cd(k.search, query.tsq) AS rank
  FROM ai_knowledge k, query
  WHERE query.tsq IS NOT NULL
    AND k.active
    AND (include_dealer OR k.audience = 'all')
    AND k.search @@ query.tsq
  ORDER BY rank DESC
  LIMIT max_rows
$$;

REVOKE ALL ON FUNCTION ai_search_knowledge(TEXT, BOOLEAN, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_search_knowledge(TEXT, BOOLEAN, INTEGER) TO service_role;

-- ─── Conversations ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant TEXT NOT NULL CHECK (assistant IN ('customer', 'dealer', 'staff')),
  -- Who: a site visitor (customer), a Pro Hub account (dealer) or a staff email.
  visitor_id TEXT,
  pro_user_id UUID REFERENCES pro_users(id) ON DELETE CASCADE,
  staff_email TEXT,
  title TEXT,
  page_url TEXT,
  model TEXT,
  prompt_version TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  -- Picked at random when the chat starts: goes to review even if it looks fine.
  sampled BOOLEAN NOT NULL DEFAULT FALSE,
  -- Latest auto-screen result: { kind: 'inquiry' | 'support_issue', reasons: [], summary }
  screen JSONB,
  screened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_pro ON ai_conversations (pro_user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_assistant ON ai_conversations (assistant, created_at DESC);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  -- [{ title, url, source }] the knowledge chunks the answer was given
  sources JSONB,
  -- [{ name, input, ok }] lookups the assistant ran
  tool_calls JSONB,
  model TEXT,
  ttft_ms INTEGER,
  total_ms INTEGER,
  input_tokens INTEGER,
  cached_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd NUMERIC(12, 6),
  -- refusal | timeout | provider error text, when the turn failed
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_messages (created_at DESC);
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- ─── Support queue ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  -- customer_handoff: a site visitor asked for a person
  -- auto_flag:        the screen found support language in a customer chat
  -- review_sample:    a random customer chat picked for review
  -- dealer_support:   a dealer asked for a person (from their Support tab)
  -- general_feedback: feedback or knowledge from a dealer or staff member
  -- feature_request:  "please add…" from a dealer or staff member
  kind TEXT NOT NULL CHECK (kind IN ('customer_handoff', 'auto_flag', 'review_sample', 'dealer_support', 'general_feedback', 'feature_request')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'waiting', 'resolved', 'wont_fix')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  subject TEXT NOT NULL,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  pro_user_id UUID REFERENCES pro_users(id) ON DELETE CASCADE,
  -- Staff member who sent feedback from the admin (feedback / feature requests).
  staff_email TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  -- Why it went wrong, set in review:
  -- missing_knowledge | wrong_answer | wrong_source | prompt | tool | site_bug | model | not_ai | feature
  cause TEXT,
  -- What fixed it: knowledge | prompt | code | model | none
  fix_type TEXT,
  resolution TEXT,
  assignee_email TEXT,
  screen_reasons TEXT[],
  -- The dealer has a staff reply they haven't opened yet.
  pro_unread BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  last_reply_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_pro ON support_tickets (pro_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_conversation ON support_tickets (conversation_id);
-- One automatic ticket of each kind per chat.
CREATE UNIQUE INDEX IF NOT EXISTS uq_support_tickets_auto
  ON support_tickets (conversation_id, kind)
  WHERE kind IN ('auto_flag', 'review_sample');
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('customer', 'pro', 'staff', 'system')),
  author_name TEXT,
  author_email TEXT,
  body TEXT NOT NULL,
  -- Staff-only note, never shown to the customer or dealer.
  internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages (ticket_id, created_at);
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS support_reviewers (
  staff_email TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE support_reviewers ENABLE ROW LEVEL SECURITY;

-- First owners of the queue: the Company Engineers super admins.
INSERT INTO support_reviewers (staff_email)
SELECT lower(email) FROM staff
WHERE is_active AND role = 'super_admin' AND name IN ('Eric', 'Jordan Buckingham', 'Tim Meyer')
ON CONFLICT DO NOTHING;

-- ─── Test cases ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_eval_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant TEXT NOT NULL CHECK (assistant IN ('customer', 'dealer', 'staff')),
  question TEXT NOT NULL,
  -- Facts a correct answer must contain, one per line in the admin.
  expected_facts TEXT[] NOT NULL DEFAULT '{}',
  -- answer | decline | handoff | tool
  expected_behavior TEXT NOT NULL DEFAULT 'answer' CHECK (expected_behavior IN ('answer', 'decline', 'handoff', 'tool')),
  notes TEXT,
  origin_ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_eval_cases ENABLE ROW LEVEL SECURITY;
