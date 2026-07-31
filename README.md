# Thoughts

> Beautiful thoughts deserve beautiful presentation.

A personal digital journal for beautiful, shareable reflections - inspired by Spotify lyrics, editorial magazines, and premium mobile apps.

**Platform:** [thoughts.dpeluola.com](https://thoughts.dpeluola.com)  
**Owner:** David Peluola  
**Status:** Phase One (MVP)

---

## Product vision

Create the most beautiful personal journaling experience on the web. Document everyday life effortlessly; every entry becomes a piece of digital art.

The long-term ambition is a living memory system culminating in **Thoughts Wrapped** - an annual retrospective of words, moods, music, and moments.

---

## What's built (Phase One)

| Feature | Status |
| --- | --- |
| Beautiful journal editor | ✅ |
| Typography engine (Lyric / Editorial / Classic) | ✅ |
| Gradient / atmosphere engine (8 themes) | ✅ |
| 9:16 image export (WhatsApp / Stories ready) | ✅ |
| Native share sheet | ✅ |
| Voice-to-text (Web Speech API) | ✅ |
| AI titles + mood detection (SpaceXAI / heuristic fallback) | ✅ |
| Public feed + single thought pages | ✅ |
| Local archive + Memories / on-this-day | ✅ |
| Mobile-first UI | ✅ |
| Dark / light theme | ✅ |
| Supabase Auth + cloud sync (optional) | ✅ |

### Coming next

- **Phase Three:** Spotify integration, animations, search, tags  
- **Wrapped:** Year-end retrospective, heatmaps, emotion trends  

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Fonts | Outfit · Playfair Display · Space Grotesk · Instrument Serif |
| Image export | html-to-image |
| Voice | Web Speech API |
| AI | SpaceXAI (`api.x.ai`) |
| Auth / DB | Supabase (optional; falls back to localStorage) |
| Deploy | Vercel |

Without Supabase env vars, the app still works entirely on **localStorage**. With them, entries sync through Supabase Auth + RLS.

---

## Quick start

```bash
cd thoughts
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy from `.env.example`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For cloud sync | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For cloud sync | Supabase anon public key |
| `XAI_API_KEY` | Optional | AI titles + mood (`api.x.ai`) |

After creating a Supabase project, run `supabase/schema.sql` in the SQL Editor, then set Auth URL config:

- Local Site URL: `http://localhost:3000`
- Local redirect: `http://localhost:3000/memories`
- Production Site URL: `https://thoughts.dpeluola.com`
- Production redirect: `https://thoughts.dpeluola.com/memories`

Without `XAI_API_KEY`, title/mood suggestions use a lightweight local heuristic.

---

## Deploy on Vercel

1. Import `Adeolu05/thoughts` in Vercel (Framework Preset: **Next.js**).
2. Add the same env vars from `.env.example` in **Project → Settings → Environment Variables** (Production + Preview).
3. Deploy. Point domain `thoughts.dpeluola.com` at the project.
4. Update Supabase Auth redirect URLs for production (above).

`vercel.json` pins the Next.js framework and build/install commands.

---
## Core user journey

```
Open → Capture (type / paste / speak)
     → Optional AI title + mood
     → Choose theme + atmosphere
     → Preview
     → Export PNG / Share / Publish
     → Archive
     → Future Wrapped
```

**Target:** open editor → exported image in under 45 seconds.

---

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Public feed + vision |
| `/create` | Private editor |
| `/thought/[slug]` | Single journal card |
| `/memories` | Archive, stats, on-this-day |
| `/api/ai` | Title + mood enrichment |

---

## Export card spec

- Canvas: **360 × 640** (9:16)
- Padding: 32px · Radius: 32px
- Footer: date + `thoughts.dpeluola.com`

---

## Design principles

1. **Beauty over complexity** - the interface disappears  
2. **Mobile first** - native feel in mobile browsers  
3. **Instant gratification** - under a minute to share  
4. **Quiet intelligence** - structured metadata for future insights  

---

## License

Private · Personal project of David Peluola.
