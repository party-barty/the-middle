


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."blocked_venues" (
    "id" "text" NOT NULL,
    "participant_id" "text" NOT NULL,
    "venue_id" "text" NOT NULL,
    "venue_name" "text" NOT NULL,
    "blocked_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."blocked_venues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."participants" (
    "id" "text" NOT NULL,
    "session_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "location_lat" double precision,
    "location_lng" double precision,
    "location_type" "text",
    "location_address" "text",
    "is_ready" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_host" boolean DEFAULT false,
    "joined_at" timestamp without time zone DEFAULT "now"(),
    "last_active" timestamp without time zone DEFAULT "now"(),
    "avatar" "text",
    "avatar_url" "text"
);


ALTER TABLE "public"."participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_history" (
    "id" "text" NOT NULL,
    "session_id" "text" NOT NULL,
    "participant_id" "text" NOT NULL,
    "matched_venue_id" "text",
    "matched_venue_name" "text",
    "matched_venue_address" "text",
    "matched_venue_lat" double precision,
    "matched_venue_lng" double precision,
    "matched_venue_photo_url" "text",
    "matched_venue_rating" double precision,
    "participant_names" "text"[],
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."session_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "text" NOT NULL,
    "midpoint_mode" "text" DEFAULT 'dynamic'::"text" NOT NULL,
    "matched_venue_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "host_id" "text",
    "is_locked" boolean DEFAULT false,
    "max_participants" integer DEFAULT 10
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_reviews" (
    "id" "text" NOT NULL,
    "session_history_id" "text" NOT NULL,
    "participant_id" "text" NOT NULL,
    "venue_id" "text" NOT NULL,
    "venue_name" "text" NOT NULL,
    "rating" integer NOT NULL,
    "review_text" "text",
    "is_blocked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "venue_reviews_rating_check" CHECK ((("rating" >= 0) AND ("rating" <= 5)))
);


ALTER TABLE "public"."venue_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venues" (
    "id" "text" NOT NULL,
    "session_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "lat" double precision NOT NULL,
    "lng" double precision NOT NULL,
    "rating" double precision,
    "price_level" integer,
    "photo_url" "text",
    "types" "text"[],
    "distance" double precision,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category" "text"
);


ALTER TABLE "public"."venues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "text" NOT NULL,
    "session_id" "text" NOT NULL,
    "participant_id" "text" NOT NULL,
    "venue_id" "text" NOT NULL,
    "vote" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "votes_vote_check" CHECK (("vote" = ANY (ARRAY['like'::"text", 'pass'::"text"])))
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."blocked_venues"
    ADD CONSTRAINT "blocked_venues_participant_id_venue_id_key" UNIQUE ("participant_id", "venue_id");



ALTER TABLE ONLY "public"."blocked_venues"
    ADD CONSTRAINT "blocked_venues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_history"
    ADD CONSTRAINT "session_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venue_reviews"
    ADD CONSTRAINT "venue_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_session_id_participant_id_venue_id_key" UNIQUE ("session_id", "participant_id", "venue_id");



CREATE INDEX "idx_blocked_venues_participant" ON "public"."blocked_venues" USING "btree" ("participant_id");



CREATE INDEX "idx_participants_session" ON "public"."participants" USING "btree" ("session_id");



CREATE INDEX "idx_session_history_participant" ON "public"."session_history" USING "btree" ("participant_id");



CREATE INDEX "idx_venue_reviews_participant" ON "public"."venue_reviews" USING "btree" ("participant_id");



CREATE INDEX "idx_venue_reviews_session_history" ON "public"."venue_reviews" USING "btree" ("session_history_id");



CREATE INDEX "idx_venues_session" ON "public"."venues" USING "btree" ("session_id");



CREATE INDEX "idx_votes_session" ON "public"."votes" USING "btree" ("session_id");



CREATE INDEX "idx_votes_venue" ON "public"."votes" USING "btree" ("venue_id");



CREATE OR REPLACE TRIGGER "participants_updated_at" BEFORE UPDATE ON "public"."participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "sessions_updated_at" BEFORE UPDATE ON "public"."sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venue_reviews"
    ADD CONSTRAINT "venue_reviews_session_history_id_fkey" FOREIGN KEY ("session_history_id") REFERENCES "public"."session_history"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all operations on blocked_venues" ON "public"."blocked_venues" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on participants" ON "public"."participants" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on session_history" ON "public"."session_history" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on sessions" ON "public"."sessions" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on venue_reviews" ON "public"."venue_reviews" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on venues" ON "public"."venues" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on votes" ON "public"."votes" USING (true) WITH CHECK (true);



ALTER TABLE "public"."blocked_venues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venue_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."blocked_venues" TO "anon";
GRANT ALL ON TABLE "public"."blocked_venues" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_venues" TO "service_role";



GRANT ALL ON TABLE "public"."participants" TO "anon";
GRANT ALL ON TABLE "public"."participants" TO "authenticated";
GRANT ALL ON TABLE "public"."participants" TO "service_role";



GRANT ALL ON TABLE "public"."session_history" TO "anon";
GRANT ALL ON TABLE "public"."session_history" TO "authenticated";
GRANT ALL ON TABLE "public"."session_history" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."venue_reviews" TO "anon";
GRANT ALL ON TABLE "public"."venue_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."venues" TO "anon";
GRANT ALL ON TABLE "public"."venues" TO "authenticated";
GRANT ALL ON TABLE "public"."venues" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































