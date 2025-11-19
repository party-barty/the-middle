ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on venues" ON venues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true) WITH CHECK (true);
