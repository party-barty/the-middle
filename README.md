# The Middle

A location-based meetup coordination app that helps groups find a mutually convenient meeting spot using midpoint calculation and swipe-based venue voting.

Homepage: 
<img width="1832" height="1522" alt="themiddle desktop" src="https://github.com/user-attachments/assets/a9e787d6-b943-43e5-8583-a8fba0aabc99" />

Icon: 
<img width="192" height="192" alt="The Middle-96x96" src="https://github.com/user-attachments/assets/24e3193e-e1f0-49ce-b0a1-a093626bbd44" />

---


# Overview

**The Middle** calculates the geographic midpoint between participants and recommends nearby venues where everyone can meet.

Participants swipe on venue cards until a match is found that everyone agrees on.

Example use cases:

- meeting friends halfway between cities
- choosing restaurants between neighborhoods
- coordinating group meetups
- planning dates or casual hangouts

---

# Table of Contents

- Overview
- Tech Stack
- Quick Start
- Environment Variables
- Documentation
- Project Status

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS

## Backend

- Supabase
- PostgreSQL
- Realtime updates

## Infrastructure

- GitHub (source control)
- Vercel (hosting)
- Supabase (backend services)

---

# Quick Start

Clone the repository:

```
git clone https://github.com/party-barty/the-middle.git
cd the-middle
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Open the application:

```
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file in the project root.

Example configuration:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

These values can be obtained from:

```
Supabase Dashboard → Project Settings → API
```

---

# Documentation

Project documentation is located in the `/docs` directory.

```
docs/

ARCHITECTURE.md
DEVELOPMENT_GUIDE.md
PROJECT_STATE.md
tempo_sundown_summary.md
PRD.md
```

These files describe the system architecture, development workflow, product design, and project history.

---

# Project Status

Status:

```
Paused
```

The project was originally built using **Tempo AI** and later migrated to a standard GitHub development workflow.

The codebase, documentation, and database schema are preserved so development can resume at any time.

---

# License

This project is currently private and under active development planning.
