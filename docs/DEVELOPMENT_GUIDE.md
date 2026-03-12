# Development Guide — The Middle

## Purpose

This document describes how to set up the development environment for **The Middle** project and resume development after the Tempo shutdown.

It includes:

- environment setup
- required tools
- local development workflow
- Supabase configuration
- deployment notes
- recommended workflow when using Claude Code

This document is intended to help a developer restart the project quickly even after a long period of inactivity.

---

# Development Stack

Frontend

React  
TypeScript  
Vite  
TailwindCSS

Backend

Supabase  
(PostgreSQL database + authentication + API)

Infrastructure

GitHub (source control)  
Vercel (hosting and deployment)  
Supabase (backend services)

Development Tools

Node.js  
npm  
Supabase CLI  
Git

---

# Prerequisites

Install the following tools before working on the project.

Node.js (recommended version: LTS)

Git

Supabase CLI

Mac install example:

brew install supabase/tap/supabase

Verify installation:

supabase --version

---

# Repository Setup

Clone the repository:

git clone https://github.com/party-barty/the-middle.git

Move into the project folder:

cd the-middle

Install dependencies:

npm install

---

# Local Development

Start the local development server:

npm run dev

The application should be available at:

http://localhost:5173

Vite provides hot module reload so changes update automatically in the browser.

---

# Environment Variables

The application connects to Supabase using environment variables.

These values are stored in a `.env` file.

Example structure:

VITE_SUPABASE_URL=your_project_url  
VITE_SUPABASE_ANON_KEY=your_public_key

These values can be found in the Supabase dashboard under:

Project Settings → API

The `.env` file should **not be committed to GitHub**.

---

# Supabase Setup

If the original Supabase project still exists:

1. Login to Supabase CLI

supabase login

2. Link the project

supabase link --project-ref PROJECT_ID

3. Verify connection

supabase status

---

# Database Recovery

The project includes two ways to restore the database schema.

Method 1 — Migration history

supabase db push

Method 2 — SQL snapshot

psql < backup.sql

Files involved:

supabase/migrations/  
backup.sql

These ensure the database structure can always be recreated.

---

# Supabase Free Tier Behavior

The project currently uses the Supabase **Free Tier**.

Important behavior:

Free projects are automatically paused after approximately 7 days of inactivity to conserve resources.

This does not delete the database.

To restore a paused project:

1. Open Supabase dashboard
2. Select the project
3. Click Resume

The database will become active again.

---

# Typical Development Workflow

1. Pull the latest code

git pull

2. Start development server

npm run dev

3. Edit source files

src/

4. Commit changes

git add .
git commit -m "describe change"

5. Push to repository

git push

---

# Using Claude Code

Claude Code can be used as an AI development assistant for this project.

Recommended workflow:

1. Open the repository in your editor
2. Run the dev server
3. Ask Claude Code for help with:

- writing React components
- building new pages
- adding Supabase queries
- debugging errors
- refactoring code

Claude should operate directly on the repository code rather than through Tempo.

---

# Deployment

Production deployment is handled through Vercel.

Typical deployment workflow:

1. Push code to GitHub
2. Vercel automatically builds the project
3. Vercel deploys the updated frontend

The deployed site connects to Supabase for backend functionality.

---

# Troubleshooting

If the application cannot connect to the database:

Check environment variables.

Verify Supabase project is active.

Confirm Supabase API keys.

Restart the development server.

---

# Future Improvements

Possible improvements during continued development:

- add server-side edge functions
- improve authentication flows
- add monitoring and analytics
- add automated tests
- implement CI/CD workflows

These improvements are optional for early development stages.

---

# Development Status

The development environment is ready to resume work.

The project can be started locally with:

npm install  
npm run dev

The codebase, database schema, and infrastructure are all preserved.

---

flowchart TD

Developer --> LocalMachine
LocalMachine --> DevServer
DevServer --> Supabase
Developer --> Git
Git --> GitHub
GitHub --> Vercel
Vercel --> ProductionSite