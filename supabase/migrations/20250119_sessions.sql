CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  midpoint_mode TEXT NOT NULL DEFAULT 'dynamic',
  matched_venue_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_type TEXT,
  location_address TEXT,
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating DOUBLE PRECISION,
  price_level INTEGER,
  photo_url TEXT,
  types TEXT[],
  distance DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, participant_id, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_venues_session ON venues(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_venue ON votes(venue_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
