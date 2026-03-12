# 🗂️ The Middle — Project Status Report
Created on March 12, 2026 - Project last meaningfully worked on Nov 19, 2025

## What Is This App?

**The Middle** is a location-based social meetup app. It calculates a geographic midpoint between a group of people and lets them vote (Tinder-style swipe) on nearby venue recommendations. A "match" occurs when all participants approve the same venue.

---

## ✅ What's Been Completed

### Core Infrastructure
- **Supabase backend** fully set up with 7 migrations covering:
  - `sessions`, `participants`, `venues`, `votes` tables
  - `session_history`, `venue_reviews`, `blocked_venues` tables
  - RLS policies enabled
  - `host_id`, `is_locked`, `max_participants`, `avatar_url`, `venue_category` columns added via incremental migrations
- **Real-time subscriptions** using Supabase's Postgres change listeners (via `subscribe()` / `notifyListeners()` in `session-store.ts`)
- **Google Maps API** integrated via `@vis.gl/react-google-maps` for map rendering and `@googlemaps/js-api-loader` for Places/Geocoding APIs

### Pages & Routing
- **HomePage (`/`)** — Landing page with parallax scrolling, create/join session forms, "How It Works" section, benefits, testimonial, ad placeholders, CTA, footer
- **SessionPage (`/session/:sessionId`)** — Main app screen (map + swipe deck side-by-side)
- **Join route (`/join/:sessionId`)** — Auto-populates the join form with a session code

### Components (All Built)
| Component | Status |
|-----------|--------|
| `LocationSetup` | ✅ Live GPS + address autocomplete (Google Places) + map pin-drop |
| `MapView` | ✅ Participant pins with avatars/initials, midpoint pin 🎯, venue dots, legend, fullscreen toggle, hover tooltips |
| `MapPicker` | ✅ Click-to-drop-pin on map with reverse geocoding |
| `SwipeDeck` | ✅ Card stack with animated like/pass overlays, progress bar, undo |
| `VenueCard` | ✅ Framer Motion swipe gestures, photo, rating, price level, type tags |
| `MatchScreen` | ✅ Celebratory modal with confetti animation, venue details, directions, share |
| `WaitingRoom` | ✅ Participant list, ready status, host controls (lock/unlock, remove participant, end session) |
| `ParticipantSidebar` | ✅ Collapsible, shows vote stats per participant |
| `VenueFilters` | ✅ Radius slider, venue type picker, min rating, max price level |
| `ProfileSettings` | ✅ Name editing, location toggle, notification toggle, session history access |
| `SessionInsights` | ✅ Duration, vote stats, approval rate, participant engagement, top categories |
| `SessionHistory` | ✅ Past sessions list, venue review (1–5 stars), written review, venue blocking |

### Business Logic
- **Midpoint calculation** — geographic centroid (average lat/lng of all participant locations)
- **Dynamic vs. Locked midpoint modes** — toggle to freeze the midpoint
- **Match detection** — `checkForMatch()` runs after every vote; detects when all participants liked the same venue
- **Demo/test mode** — entering name `test-user2` creates a fake two-person demo session with a bot that auto-votes (session ID `222222`)
- **Session management** — create, join (with locked/capacity checks), lock session, remove participant, end session
- **Venue search** — Google Places New API (`Place.searchNearby`) fetching up to 20 venues sorted by rating + distance
- **Blocked venues** — users can block venues from appearing in future searches (DB only; filtering not yet applied at search time)

---

## ❌ What Still Needs To Be Done

### 🔴 Critical / Broken

1. **`SessionInsights` is broken** — The component treats `session.votes` as an object (`Object.values(session.votes)`) but it's actually a flat array of `Vote` objects. This will throw a runtime error whenever Insights is opened.

2. **No real-time Supabase subscriptions in `SessionPage`** — The `subscribe()` method in `session-store.ts` is a local in-memory listener that only fires when the *same client* calls `notifyListeners()`. There are no Supabase Realtime channel subscriptions (`supabase.channel(...).on('postgres_changes', ...)`) on the main session. This means **changes from other participants won't appear until the page is refreshed**.

3. **`allReady` state never becomes `true`** — In `SessionPage.tsx`, `allReady` is initialized to `false` and never updated. The swipe deck and "waiting for participants" banner depend on this flag. The swipe deck will never show.

4. **`SessionPage.handleReady` is unused** — `markParticipantReady` is called but there's no `WaitingRoom` rendered (it was bypassed with a comment: *"Always show the main view with map - no waiting room blocking"*). The `WaitingRoom` component exists but isn't wired in.

5. **Blocked venues not filtered at search time** — The `blockVenue` / `getBlockedVenues` infrastructure exists in the DB and store, but `searchNearbyVenues` doesn't accept or apply a blocked list.

6. **`SessionPage.handleUpdateProfile` has a TypeScript error** — `typeof session.participants[0]` is evaluated before `session` is guaranteed non-null (though a null check exists slightly above it via the `!session` early return).

### 🟡 Incomplete / Partially Working

7. **"No matches" / expand search radius flow** — The PRD calls for an option to expand the search radius when all venues are exhausted. Currently the SwipeDeck just shows "All done! Waiting for others to vote..." with no option to expand or reset.

8. **Match screen "close" does nothing useful** — `MatchScreen`'s `onClose` in `SessionPage` has an empty callback. Closing should offer "Start new search" / "End session" options.

9. **Session history never gets saved** — `saveSessionHistory()` exists in the store but is never called. There's no trigger when a session ends or a match is found.

10. **`ProfileSettings` notifications toggle** — The UI has a notifications toggle but it's wired to local state only; no push notification infrastructure exists.

11. **Avatar upload** — The `Camera` icon is in `ProfileSettings` but clicking it does nothing (no file upload handler or Supabase Storage integration).

12. **`WaitingRoom` component isn't rendered** — It's imported in `SessionPage` but commented out in favour of always showing the map. The WaitingRoom has host controls (kick, lock, end session) that are now inaccessible.

13. **Ad placeholders** — The homepage has clearly marked `Ad Space 728x90` and `Ad Space 300x250` placeholders that need real ad units or removal.

14. **Privacy and Terms pages** — Links exist in the header/footer but go to `#`.

---

## ⚠️ Areas for Improvement

### Architecture
- **`session-store.ts` is 893 lines** — It's doing too many things. Consider splitting into: `session.ts`, `participant.ts`, `venue.ts`, `vote.ts`, and `history.ts` modules.
- **No real-time sync** — Every mutation calls `getSession()` (a full re-fetch of 4 tables) then `notifyListeners()`. This is expensive and won't sync across browser tabs/devices. Replace with Supabase Realtime channel subscriptions.
- **Participant identity is fragile** — Participant IDs are random strings stored only in the URL query param (`?participantId=...`). Refreshing the page or sharing the session link loses the participant identity. Consider `localStorage` persistence.
- **`mapId: 'DEMO_MAP_ID'`** — The Google Maps map ID is hardcoded to the demo value. For production, a real map ID should be registered in Google Cloud Console to enable custom styling and AdvancedMarkers.

### Code Quality
- **Duplicate code** — `getInitials()` and `getAvatarColor()` are copy-pasted across `MapView`, `WaitingRoom`, `ParticipantSidebar`. Extract to `src/lib/utils.ts`
- **Hard-coded demo avatar URLs** — GitHub/Google profile photos are baked into `session-store.ts` as default avatars for demo users.
- **`// @ts-expect-error`** in `maps.ts` — The new Places API types aren't fully available; this should be resolved when stable typings ship.
- **`alert()` calls** — `HomePage.tsx` uses native `alert()` for errors. Should use the `toast` system already in place.
- **`LocationSetup` has a missing `currentLocation` prop** — The component interface only declares `onLocationSet`, but `SessionPage` passes both `onLocationSet` and `currentLocation`. The interface doesn't accept `currentLocation`.
- **Unused `markParticipantReady` vs `updateParticipantReady`** — Two slightly different method names for the same operation exist in the store.

### UX / Design
- **Mobile layout** — The session page uses `md:flex-row` but on mobile the map and swipe deck are stacked. The map takes up a lot of space before the user sees the swipe deck.
- **No loading/error states** in several components when Supabase calls fail.
- **Midpoint mode button** is in the top-left of the map but overlaps with other map controls on smaller screens.
- **"Waiting for participants" banner** obscures the top of the map and has no dismiss option.

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/session-store.ts` | All Supabase data operations — the main backend abstraction |
| `src/lib/maps.ts` | Google Maps initialization + Places venue search + geocoding |
| `src/pages/SessionPage.tsx` | Main app orchestrator — state management for the active session |
| `src/pages/HomePage.tsx` | Landing page + create/join session forms |
| `src/types/session.ts` | All TypeScript interfaces (Session, Participant, Venue, Vote, etc.) |
| `supabase/migrations/` | Database schema history (7 migration files, run in order) |

---

## 🔑 Environment Variables Required

| Variable | Used For |
|----------|----------|
| `VITE_GOOGLE_MAPS_API_KEY` | Maps rendering, Places search, geocoding, autocomplete |
| `VITE_SUPABASE_URL` | Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Supabase client |

---

## 🚀 Suggested Next Priorities

1. **Fix `allReady` state** in `SessionPage` — derive it from `session.participants.every(p => p.isReady)` reactively
2. **Add Supabase Realtime** subscriptions so changes from other devices sync live
3. **Persist participant ID** in `localStorage` so page refreshes don't break identity
4. **Fix `SessionInsights` vote data shape** bug before it crashes users
5. **Wire in the "no matches" / expand radius** end-of-deck flow
6. **Call `saveSessionHistory`** when a match is found or session ends
