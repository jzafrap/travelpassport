# TravelPassport — Design Document
**Date:** 2026-03-01
**Status:** Approved

---

## 1. Overview

TravelPassport is a geo-social web application where users register travel destinations (POIs) on an interactive map. It has two modes: a public **Social View** showing all community POIs, and a private **My Passport** view showing the authenticated user's own travels. A highlight feature is the **GlobalPassport**, a downloadable diploma showing the user's world map with all their POIs marked.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Frontend + API | **Next.js 14** (App Router) |
| Auth | **NextAuth.js** — Google OAuth 2.0 |
| Database | **Supabase** (PostgreSQL 15 + PostGIS) |
| ORM | **Prisma** (with raw SQL for geo queries) |
| Photo storage | **Cloudinary** (thumbnails, CDN, transformations) |
| Map (interactive) | **Google Maps JavaScript API** via `@react-google-maps/api` |
| Map (diploma) | **react-simple-maps** (SVG, no API cost) |
| Diploma export | **html2canvas** → PNG download |
| Google Photos | **Google Picker API** (JS, read-only picker) |
| Styling | **Tailwind CSS** |
| Language | **TypeScript** |

**Development:** `npm run dev` + Supabase cloud DB (no Docker required locally)
**Production:** Docker Compose (app + optional local DB) — portable to any cloud

---

## 3. Data Model

```sql
users
  id            UUID PRIMARY KEY
  google_id     VARCHAR UNIQUE NOT NULL
  email         VARCHAR UNIQUE NOT NULL
  name          VARCHAR NOT NULL
  alias         VARCHAR
  residence     VARCHAR
  age           INTEGER
  avatar_url    VARCHAR
  created_at    TIMESTAMP

pois
  id            UUID PRIMARY KEY
  user_id       UUID → users
  title         VARCHAR NOT NULL
  description   TEXT
  location      GEOGRAPHY(POINT, 4326)   -- PostGIS
  date_visited  DATE NOT NULL
  main_photo_id UUID → photos (nullable, set after upload)
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

photos
  id                  UUID PRIMARY KEY
  poi_id              UUID → pois
  cloudinary_url      VARCHAR NOT NULL
  cloudinary_public_id VARCHAR NOT NULL
  thumbnail_url       VARCHAR             -- Cloudinary auto-transform
  is_main             BOOLEAN DEFAULT false
  created_at          TIMESTAMP

tags  (predefined catalog ~25 entries, seeded)
  id     UUID PRIMARY KEY
  key    VARCHAR UNIQUE          -- e.g. "hiking"
  label  VARCHAR                 -- e.g. "Ruta a pie"
  emoji  VARCHAR                 -- e.g. "🥾"
  color  VARCHAR                 -- hex for UI chip

poi_tags  (many-to-many)
  poi_id  UUID → pois
  tag_id  UUID → tags
  PRIMARY KEY (poi_id, tag_id)

likes  (toggle)
  user_id  UUID → users
  poi_id   UUID → pois
  created_at TIMESTAMP
  PRIMARY KEY (user_id, poi_id)

ratings
  user_id  UUID → users
  poi_id   UUID → pois
  stars    INTEGER  CHECK (1-5)
  created_at TIMESTAMP
  PRIMARY KEY (user_id, poi_id)

wishlist  ("follow" / want-to-visit)
  user_id  UUID → users
  poi_id   UUID → pois
  created_at TIMESTAMP
  PRIMARY KEY (user_id, poi_id)
```

**Spatial index** on `pois.location` for bounding-box map queries.

---

## 4. Tag Catalog (predefined, ~25 tags)

| Key | Emoji | Label |
|---|---|---|
| hiking | 🥾 | Ruta a pie |
| kids | 👶 | Apto para niños |
| pets | 🐾 | Apto para mascotas |
| water | 💧 | Hay agua |
| ruins | 🏛️ | Ruinas históricas |
| cave | 🕳️ | Cuevas |
| beach | 🏖️ | Playa |
| mountain | 🏔️ | Montaña |
| city | 🏙️ | Ciudad |
| food | 🍽️ | Gastronomía |
| nature | 🌿 | Naturaleza |
| viewpoint | 👁️ | Mirador |
| camping | ⛺ | Camping |
| museum | 🎨 | Museo / Arte |
| wildlife | 🦁 | Fauna salvaje |
| snow | ❄️ | Nieve / Esquí |
| boat | ⛵ | Barco / Náutica |
| cycling | 🚴 | Ruta en bici |
| photo | 📷 | Fotogénico |
| religious | ⛪ | Lugar religioso |
| market | 🛍️ | Mercado |
| nightlife | 🌙 | Vida nocturna |
| accessible | ♿ | Accesible |
| free | 🆓 | Entrada gratuita |
| hidden_gem | 💎 | Joya oculta |

---

## 5. Application Views

### 5.1 Social View (public, unauthenticated)
- Full-screen Google Maps
- POI markers show thumbnail photo (Cloudinary auto-crop) + up to 3 tag emojis
- Left sidebar: **Top 10 most liked** + **Last 24h** (max 10)
- Controls: search by place name, date range filter, filter by tags
- Click POI → detail modal: gallery, title, author, date, likes ♥, stars ⭐, description, tags, [Like] [Rate] [Add to Wishlist] buttons (auth required for interaction)
- Header: login button → Google OAuth

### 5.2 My Passport (authenticated)
- Header: avatar, name/alias, stats (countries, POIs, likes received)
- Map shows only user's POIs, colored by year or rating
- Sidebar: activity stats, [+ New Trip] button, [🎫 GlobalPassport] button, [📌 Wishlist] section
- Click on map (empty area) → create POI form (lat/lng pre-filled)
- Click on existing POI → edit/delete options
- Date filter applies to user's map

### 5.3 POI Create/Edit Form
- Location: auto-filled from map click, editable
- Title, description (textarea)
- Date visited (date picker)
- Tags: multi-select chips from catalog
- Photos: upload from device OR select from Google Photos Picker
- Mark one photo as main (shown as thumbnail on map)

### 5.4 GlobalPassport (diploma)
- World SVG map (react-simple-maps) with POI dots
- User info: name, member since, stats block
- Stats: countries count, POI count, likes received, avg rating
- [⬇ Download PNG] → html2canvas capture
- [🔗 Share link] → public URL `/passport/:userId`

---

## 6. API Routes

```
GET  /api/pois                  → list (params: bbox, dateFrom, dateTo, tags, limit)
GET  /api/pois/trending         → top 10 by likes
GET  /api/pois/recent           → last 24h (max 10)
GET  /api/pois/:id              → single POI detail
POST /api/pois                  → create (auth)
PUT  /api/pois/:id              → update (auth, own)
DEL  /api/pois/:id              → delete (auth, own)

POST /api/pois/:id/like         → toggle like (auth)
POST /api/pois/:id/rate         → set rating 1-5 (auth)
POST /api/pois/:id/wishlist     → toggle wishlist (auth)

POST /api/photos/upload         → upload to Cloudinary, save to DB
DEL  /api/photos/:id            → delete from Cloudinary + DB

GET  /api/users/me              → current user profile
PUT  /api/users/me              → update profile
GET  /api/users/me/pois         → user's POIs
GET  /api/users/me/stats        → activity stats
GET  /api/users/me/wishlist     → wishlist POIs

GET  /api/tags                  → full tag catalog

GET  /api/passport/:userId      → GlobalPassport data (public)

GET  /api/auth/[...nextauth]    → NextAuth.js handler
```

These routes double as the **REST API for future React Native mobile app**.

---

## 7. Google Integrations

| Integration | Scope / Notes |
|---|---|
| Google OAuth | `openid profile email` via NextAuth.js |
| Google Photos Picker | `https://www.googleapis.com/auth/photospicker` — read-only picker widget, user selects photos, app downloads selected items |
| Google Maps JS API | Map rendering, geocoding (place search), markers |

---

## 8. GlobalPassport Feature Detail

1. Route: `/passport/[userId]` — public, shareable
2. Renders a styled "diploma" component using `react-simple-maps` SVG world map
3. POI dots plotted by lat/lng
4. Stats pulled from `/api/passport/:userId`
5. Export: `html2canvas` captures the diploma div → triggers PNG download
6. Shareable: the URL itself is public (no auth required to view)

---

## 9. Project Structure

```
travelpassport/
├── src/
│   ├── app/
│   │   ├── (public)/page.tsx           ← Social view
│   │   ├── (auth)/
│   │   │   ├── passport/page.tsx       ← My Passport
│   │   │   └── globalpassport/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── pois/route.ts + [id]/
│   │   │   ├── photos/
│   │   │   ├── users/
│   │   │   ├── tags/route.ts
│   │   │   └── passport/[userId]/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── map/                        ← MapView, POIMarker, MapControls
│   │   ├── poi/                        ← POICard, POIModal, POIForm
│   │   ├── passport/                   ← GlobalPassportDiploma
│   │   └── ui/                         ← Button, Modal, TagChip, etc.
│   ├── lib/
│   │   ├── db.ts                       ← Prisma client singleton
│   │   ├── cloudinary.ts
│   │   └── auth.ts                     ← NextAuth config
│   └── types/index.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                         ← Seed tags catalog
│   └── migrations/
├── docs/plans/
│   └── 2026-03-01-travelpassport-design.md
├── docker-compose.yml                  ← For future production deploy
├── Dockerfile
├── .env.local.example
└── package.json
```

---

## 10. Environment Variables

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Database (Supabase)
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Maps (public)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## 11. Development Setup (no Docker)

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with Supabase + Google + Cloudinary credentials
npx prisma migrate dev
npx prisma db seed          # seeds tag catalog
npm run dev                 # http://localhost:3000
```

---

## 12. Verification

- [ ] Social map loads POI markers with thumbnails
- [ ] Google OAuth login/logout flow works
- [ ] Create POI: click map → form → save → marker appears
- [ ] Upload photo from device → appears in POI gallery, main photo shown as marker
- [ ] Google Photos Picker opens and selected photo uploads to Cloudinary
- [ ] Like / rate / wishlist toggles work
- [ ] Trending and recent 24h lists update correctly
- [ ] My Passport shows only own POIs with stats
- [ ] Edit / delete POI works
- [ ] Tag filter works in both social and passport views
- [ ] GlobalPassport diploma renders world map + user POIs + stats
- [ ] Download PNG produces a clean image
- [ ] All API endpoints return correct JSON (testable via REST client)
- [ ] Supabase PostGIS bounding-box query returns correct POIs on map pan/zoom
