# PROJECT_RULES.md
Location: /.claude/PROJECT_RULES.md

This document defines the **operational rules for AI coding assistants** working on The Middle project.

Claude Code should read this file before performing any code changes.

These rules exist to prevent architectural drift, accidental refactors, and unsafe database modifications.

---

# Project Overview

Project name: The Middle

The Middle is a **location-based meetup coordination web application**.

The goal of the application is to allow two or more users to input locations and find a mutually convenient meeting point with nearby venue suggestions.

The project is currently **paused but fully recoverable**.

All code, database schema, and infrastructure documentation exist in the repository.

---

# Source of Truth Hierarchy

If documentation conflicts, trust files in this order:

1. PRD documents
2. ARCHITECTURE.md
3. DEVELOPMENT_GUIDE.md
4. PROJECT_STATE.md
5. CLAUDE_CONTEXT.md

Claude should never override architecture described in ARCHITECTURE.md without explicit instruction.

---

# Technology Stack

Frontend

React  
TypeScript  
Vite  
TailwindCSS

Backend

Supabase  
PostgreSQL

Infrastructure

GitHub (source control)  
Vercel (hosting)  
Supabase (database + auth)

---

# Architecture Rules

The project follows a **serverless frontend architecture**.

The React frontend communicates directly with Supabase.

There is currently **no custom backend server**.

Architecture:

User Browser  
↓  
React Frontend  
↓  
Supabase Client  
↓  
Supabase API  
↓  
PostgreSQL Database

Claude must preserve this architecture unless explicitly instructed to change it.

---

# Repository Structure

the-middle/

public/  
src/  
components/  
pages/  
lib/

supabase/  
migrations/

backup.sql

Claude should maintain this structure when adding new files.

New feature code should live inside:

src/

---

# Coding Guidelines

Use TypeScript strictly.

Prefer small React functional components.

Avoid deeply nested component trees.

Prefer:

composition over inheritance

Use TailwindCSS for styling.

Avoid introducing large UI frameworks unless explicitly requested.

---

# Database Rules

Database is hosted on Supabase.

Schema recovery exists in two locations:

supabase/migrations/  
backup.sql

Claude must NOT:

- drop tables
- rename tables
- delete columns

without explicit confirmation.

Schema changes must be implemented through migrations.

---

# Supabase Usage Rules

Always use the official Supabase JS client.

Avoid writing direct SQL queries in frontend code unless necessary.

Prefer Supabase client methods:

select  
insert  
update  
delete

Authentication should remain handled through Supabase Auth.

---

# Development Commands

Install dependencies

npm install

Start development server

npm run dev

Build project

npm run build

Preview production build

npm run preview

---

# Git Rules

Claude should not rewrite commit history.

Claude should not delete branches.

Claude should avoid large multi-file refactors unless explicitly requested.

Prefer small incremental commits.

---

# Safety Rules

Claude must NOT run destructive infrastructure commands.

Never run commands like:

terraform destroy  
supabase db reset  
rm -rf

unless the user explicitly requests them.

---

# When Adding New Features

Claude should follow this workflow:

1. Check PROJECT_STATE.md to understand current progress
2. Confirm feature aligns with MVP
3. Create minimal implementation
4. Avoid unnecessary dependencies
5. Maintain current architecture

---

# Context Files

The following files provide project knowledge:

CLAUDE_CONTEXT.md  
ARCHITECTURE.md  
DEVELOPMENT_GUIDE.md  
PROJECT_STATE.md

Claude should read these files before implementing changes.

---

# Development Status

Status: Paused

The project is not currently under active development.

The purpose of the repository is to preserve the application and allow future development.

Claude should treat the repository as **stable baseline code**.

---

# Claude Behavior Expectations

Claude should:

- ask questions before large refactors
- propose architecture changes before implementing them
- explain significant code modifications
- preserve repository structure

Claude should avoid making speculative architectural changes.

---

# Final Rule

When uncertain:

ASK BEFORE MODIFYING ARCHITECTURE.