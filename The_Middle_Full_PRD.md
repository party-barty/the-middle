# The Middle — Product Requirements Document

## Product Overview

**The Middle** is a responsive web app that calculates the geographic midpoint between friend groups and recommends nearby venues through a swipe-based voting system, achieving a match when all participants approve the same location.

---

## Key Features & Functionality

### 1. Interactive Map View
- Display all participant locations with pins (live vs. manual)
- Calculate and show the geographic centroid
- Visualize recommended venues near the midpoint
- Support for dynamic or locked midpoint calculation modes

### 2. Swipe Voting Interface
- Tinder-style card deck with venue cards showing:
  - Photos
  - Ratings
  - Distance from midpoint
  - Categories
- Swipe right to approve, left to reject
- Real-time sync across all participants

### 3. Session Management
- Create or join sessions via shareable link (no login required for MVP)
- Track participants, location modes, and votes with live updates
- Session codes for easy sharing
- Host controls: lock session, remove participants, end session

### 4. Flexible Location Input
- Users can share real-time device location
- Manual location via address search / pin drop
- Dynamic or locked midpoint calculation modes

### 5. Match Display
- When all users approve the same venue, show a celebratory match screen
- Venue details and next steps (directions, share result)

---

## User Flow

### Session Entry
1. **User Opens App** → Check for existing session
2. **No Session** → Create or Join
3. **Create New** → Generate session + share link/code
4. **Join Existing** → Enter session code/link → Validate → Join

### Location Setup
1. Choose location mode: **Live** or **Manual**
2. Live: Request browser geolocation permission
3. Manual: Address search or pin drop on map
4. Confirm location → Enter waiting room

### Waiting Room
1. See participant list with ready status
2. Activity indicators (active, idle, away)
3. Host controls (lock, remove, end session)
4. All participants ready → Calculate midpoint

### Map + Swipe View
1. Map shows: participant pins, midpoint, venue markers
2. Swipe deck loads venue recommendations near midpoint
3. Each participant swipes independently
4. Votes sync in real-time across all participants

### Match Flow
1. All users approve same venue → **Match Found!**
2. Celebration animation
3. Venue details displayed
4. Options: View directions, Share result, New search, End session

### No Match Path
- More venues available → Load next card
- No venues left → Options: Expand radius, Reset votes, End session

---

## Technical Architecture

### Frontend
- **Framework:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS
- **Maps:** Google Maps JavaScript API (Advanced Markers, Places API)
- **Animations:** Framer Motion
- **UI Components:** ShadCN/UI + Radix primitives
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime (Postgres Changes)
- **Auth:** No auth required for MVP (session-based)

### Database Schema

#### `sessions`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Session code |
| midpoint_mode | TEXT | 'dynamic' or 'locked' |
| matched_venue_id | TEXT | Matched venue ID (nullable) |
| host_id | TEXT | Host participant ID |
| is_locked | BOOLEAN | Whether session accepts new participants |
| max_participants | INTEGER | Max allowed participants |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `participants`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Participant ID |
| session_id | TEXT (FK) | Session reference |
| name | TEXT | Display name |
| location_lat | DOUBLE | Latitude |
| location_lng | DOUBLE | Longitude |
| location_type | TEXT | 'live' or 'manual' |
| location_address | TEXT | Address string |
| is_ready | BOOLEAN | Ready status |
| is_host | BOOLEAN | Host flag |
| avatar_url | TEXT | Profile avatar URL |
| joined_at | TIMESTAMPTZ | Join timestamp |
| last_active | TIMESTAMPTZ | Last activity timestamp |

#### `venues`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Venue/Place ID |
| session_id | TEXT (FK) | Session reference |
| name | TEXT | Venue name |
| category | TEXT | Primary category |
| address | TEXT | Full address |
| lat | DOUBLE | Latitude |
| lng | DOUBLE | Longitude |
| rating | DOUBLE | Google rating |
| price_level | INTEGER | Price level (1-4) |
| photo_url | TEXT | Photo URL |
| types | TEXT[] | Place types |
| distance | DOUBLE | Distance from midpoint (km) |

#### `votes`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Vote ID |
| session_id | TEXT (FK) | Session reference |
| participant_id | TEXT (FK) | Participant reference |
| venue_id | TEXT | Venue reference |
| vote | TEXT | 'like' or 'pass' |

#### `session_history`
- Stores completed session records for participant history

#### `venue_reviews`
- Stores post-session venue reviews and ratings

#### `blocked_venues`
- Stores participant-blocked venues

---

## UI & Design Notes

### Design Inspiration
- Combine **Airbnb Design System's** clean, modern aesthetic with **Beli's** playful branding
- Tailwind CSS for styling

### Layout
- **Desktop:** Split view (map + swipe deck side-by-side)
- **Mobile:** Stacked layout with smooth transitions

### Microanimations
- Swipe actions (card fly-off, spring physics)
- Match reveals (celebration confetti/animation)
- Location updates (marker transitions)

### Components
- Reusable venue cards
- Custom map markers (avatar-based)
- Swipe gesture handlers
- Real-time participant list
- Session controls & host management

---

## Demo / Testing Mode

### Demo Session (ID: `222222`)
- **Trigger:** Enter name "test-user2" when creating session, OR visit `/join/222222`
- **test-user1 (bot):**
  - Location: 1051 N Genesee Ave, West Hollywood, CA 90046 (34.0928, -118.3287)
  - Avatar: Google profile photo
  - Auto-votes on venues (60% like, 40% pass) with 1-3 second delays
- **test-user2 (you):**
  - Default avatar: GitHub profile photo
  - Auto-joins session, sets location, proceeds to map view

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_PROJECT_ID` | Supabase project ID |
| `SUPABASE_URL` | Supabase URL (server-side) |
| `SUPABASE_ANON_KEY` | Supabase anon key (server-side) |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |

---

## MVP Scope

### In Scope
- Session creation and joining (no auth)
- Live and manual location input
- Midpoint calculation (dynamic & locked)
- Google Places venue search near midpoint
- Swipe-based voting with real-time sync
- Match detection and celebration screen
- Shareable session links/codes
- Host controls (lock, remove, end)
- Participant activity tracking
- Session history and venue reviews
- Demo/testing mode

### Out of Scope (Post-MVP)
- User authentication / accounts
- Push notifications
- Saved favorite venues
- Group chat within session
- Advanced venue filtering (cuisine type, hours, etc.)
- Multi-round voting
- Calendar integration
- Native mobile apps

---

## Success Metrics
- Session creation → midpoint calculation in < 30 seconds
- Venue match achieved within average of 10 swipes per participant
- Session join via link works in < 5 seconds
- Real-time sync latency < 2 seconds

---

*© The Middle, 2025*
