# Product Requirements Document (PRD)

# Thoughts

### A Personal Digital Journal for Beautiful, Shareable Reflections

Version 1.0

Owner: David Peluola

Platform: thoughts.dpeluola.com

Status: Phase Two in progress (archive, sync, streaks)

---

# Executive Summary

Thoughts is a personal publishing platform designed around one simple belief:

> Beautiful thoughts deserve beautiful presentation.

Instead of writing long blog posts or temporary social media captions, Thoughts transforms everyday reflections into carefully designed visual cards inspired by Spotify lyrics, modern editorial magazines, and premium mobile applications.

The experience prioritises speed, aesthetics and emotional expression.

Every journal entry becomes something worth sharing.

While today's product focuses on creating and exporting beautiful reflections, the underlying architecture quietly captures structured metadata that will eventually power a deeply personal annual review experience similar to Spotify Wrapped.

Thoughts is intentionally built as a long-term digital archive rather than another blogging platform.

---

# Product Vision

Create the most beautiful personal journaling experience on the web.

A place where documenting everyday life feels effortless and every entry becomes a piece of digital art.

The platform should feel closer to Spotify, Apple Notes and Read.cv than Medium or WordPress.

---

# Mission Statement

Reduce the friction between having a thought and preserving it beautifully.

---

# Product Philosophy

Every design decision should follow these principles.

## Beauty over complexity

The interface should disappear. Writing should feel calming. Nothing should compete with the words.

## Mobile First

Most entries will be created or consumed on phones. Desktop is secondary.

## Instant Gratification

From opening the page to sharing a journal entry should take less than one minute.

## Quiet Intelligence

Although the interface appears simple, the system should collect meaningful structured information that powers future insights: emotions, writing frequency, favourite themes, music history, yearly milestones.

---

# Success Metrics

## Primary

| Metric | Target |
| --- | --- |
| Average time from opening editor to exported image | < 45 seconds |
| Journal creation success rate | > 95% |
| Image export success rate | 100% |
| Average monthly journal entries | 20+ |

## Long-term

Publishing streaks · Returning users · Entries shared externally · Voice-to-text usage · Spotify integration usage · Year-end Wrapped completion

---

# Feature Set

## Version 1 (shipped)

- Beautiful journal editor (with edit in place)
- Image export (9:16 PNG) without auto-publishing
- Theme engine + gradient engine
- Local archive, merge-safe with optional Supabase Auth + RLS
- Public journal feed (client)
- Voice-to-text
- AI titles + mood detection + tags
- Memory resurfacing (on this day)
- Search + tag filter
- Writing streaks + month calendar

## Version 2 (remaining)

Mood tracking UI · Collections · Dark mode scheduling · Pinned memories

## Version 3

Thoughts Wrapped · Writing heatmaps · Emotion trends · Most listened songs · Favourite verses · Life milestones · Interactive timeline

---

# Premium differentiators

1. **AI-generated titles** - concise poetic titles after writing  
2. **Mood detection** - structured emotional metadata  
3. **Memory resurfacing** - “On this day, one year ago…”  
4. **Rich media** (planned) - single photo, voice note, or short video per entry  

---

# Technical Architecture

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database (future) | Supabase PostgreSQL |
| Storage (future) | Supabase Storage |
| Auth (future) | Supabase Auth |
| Image Export | html-to-image |
| Voice Input | Web Speech API |
| AI | SpaceXAI / xAI |
| Music (future) | Spotify Web API |
| Deployment | Vercel |

---

# Export Card Specification

- Canvas: 360 × 640  
- Aspect ratio: 9:16  
- Safe area: 24px · Padding: 32px · Radius: 32px  
- Footer: date + watermark `thoughts.dpeluola.com`
