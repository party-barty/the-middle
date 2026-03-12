# Claude Context — The Middle

## Purpose

This document provides context for AI coding assistants (Claude Code, etc.) working on **The Middle** project.

It explains:

- product concept
- architecture
- repository structure
- development workflow
- backend integration
- coding guidelines

AI assistants should read this document before making architectural or structural changes.

---

# Project Summary

The Middle is a **location-based meetup coordination application**.

The purpose of the application is to help two or more people find a mutually convenient meeting location.

Users provide their locations and the system calculates a midpoint and suggests nearby places.

### Example use cases

- meeting friends halfway between cities  
- choosing restaurants between neighborhoods  
- coordinating social meetups  
- planning casual dates  

The project is currently paused but fully recoverable.

---

# Technology Stack

## Frontend

- React  
- TypeScript  
- Vite  
- TailwindCSS  

## Backend

- Supabase  
- PostgreSQL  
- Supabase JS Client  

## Infrastructure

- Vercel (hosting + domain)
- GitHub (source control)

---

# Architecture

User → Browser  
Browser → React App  
React App → Supabase Client  
Supabase Client → Supabase API  
Supabase API → PostgreSQL Database  

---

# Repository Structure

```
the-middle/

public/
src/
  components/
  pages/
  lib/

supabase/
  migrations/

backup.sql
package.json
vite.config.ts
```

---

# Database

Database is hosted on **Supabase (PostgreSQL)**.

Schema recovery methods:

### 1. Supabase migration history

```
supabase/migrations/
```

### 2. SQL snapshot

```
backup.sql
```

Either method can recreate the database schema.

---

# Local Development

### Clone the repository

```
git clone https://github.com/party-barty/the-middle.git
```

### Install dependencies

```
npm install
```

### Run development server

```
npm run dev
```

### Open browser

```
http://localhost:5173
```

---

# Restarting Development

When restarting the project:

1. Verify Supabase project status  
2. Restore schema if needed  
3. Update environment variables  
4. Run development server  
5. Continue feature development  

Claude Code can be used to accelerate feature implementation.

---

# Project Status

**Status:** Paused

All critical assets preserved:

- full codebase in GitHub
- Supabase schema backup
- migration history
- PRD documentation

The project can be resumed at any time.

---

# Notes for AI Agents

When modifying this project:

- preserve Supabase schema compatibility  
- maintain TypeScript type safety  
- follow existing folder structure  
- prefer small modular components  

If backend schema changes are required:

- create migration files  
- update Supabase client usage  
- document schema changes