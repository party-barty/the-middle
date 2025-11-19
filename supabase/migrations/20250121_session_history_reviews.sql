CREATE TABLE IF NOT EXISTS session_history (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  matched_venue_id TEXT,
  matched_venue_name TEXT,
  matched_venue_address TEXT,
  matched_venue_lat DOUBLE PRECISION,
  matched_venue_lng DOUBLE PRECISION,
  matched_venue_photo_url TEXT,
  matched_venue_rating DOUBLE PRECISION,
  participant_names TEXT[],
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_reviews (
  id TEXT PRIMARY KEY,
  session_history_id TEXT NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_venues (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_session_history_participant ON session_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_session_history ON venue_reviews(session_history_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_participant ON venue_reviews(participant_id);
CREATE INDEX IF NOT EXISTS idx_blocked_venues_participant ON blocked_venues(participant_id);

DROP POLICY IF EXISTS "Allow all operations on session_history" ON session_history;
DROP POLICY IF EXISTS "Allow all operations on venue_reviews" ON venue_reviews;
DROP POLICY IF EXISTS "Allow all operations on blocked_venues" ON blocked_venues;

CREATE POLICY "Allow all operations on session_history" ON session_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on venue_reviews" ON venue_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on blocked_venues" ON blocked_venues FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_venues ENABLE ROW LEVEL SECURITY;
