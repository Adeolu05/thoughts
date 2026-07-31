import { NextRequest, NextResponse } from "next/server";

/**
 * AI enrichment: title suggestion + mood detection via SpaceXAI (xAI).
 * Set XAI_API_KEY in .env.local. Falls back gracefully when missing.
 */

const SYSTEM = `You are a thoughtful editor for a personal journal called Thoughts.
Given a journal entry, respond with ONLY valid JSON (no markdown):
{
  "title": "A concise poetic title, 2-6 words, title case",
  "mood": "one of: hopeful, reflective, grateful, anxious, excited, peaceful, melancholy, determined, joyful, neutral",
  "tags": ["up to 4 short lowercase tags"]
}`;

export async function POST(req: NextRequest) {
  try {
    const { content } = (await req.json()) as { content?: string };
    if (!content || content.trim().length < 8) {
      return NextResponse.json(
        { error: "Content too short" },
        { status: 400 }
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      // Heuristic fallback so the product still feels smart offline
      return NextResponse.json(localEnrich(content));
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: content.slice(0, 2000) },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("xAI error:", text);
      return NextResponse.json(localEnrich(content));
    }

    const data = await res.json();
    const raw =
      data.choices?.[0]?.message?.content ??
      data.output_text ??
      "";

    const parsed = parseJson(raw);
    if (!parsed) {
      return NextResponse.json(localEnrich(content));
    }

    return NextResponse.json({
      title: String(parsed.title ?? "").slice(0, 80),
      mood: String(parsed.mood ?? "reflective").toLowerCase(),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map(String).slice(0, 4)
        : [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "AI enrichment failed" },
      { status: 500 }
    );
  }
}

function parseJson(raw: string): Record<string, unknown> | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function localEnrich(content: string) {
  const words = content.trim().split(/\s+/);
  const first = words.slice(0, 4).join(" ");
  const title =
    first.charAt(0).toUpperCase() + first.slice(1).replace(/[.,!?]$/, "");

  const lower = content.toLowerCase();
  let mood = "reflective";
  if (/grateful|thankful|blessed|appreciate/.test(lower)) mood = "grateful";
  else if (/hope|tomorrow|will|believe/.test(lower)) mood = "hopeful";
  else if (/excit|can't wait|amazing|yes!/.test(lower)) mood = "excited";
  else if (/anx|worry|fear|stress/.test(lower)) mood = "anxious";
  else if (/peace|calm|quiet|still/.test(lower)) mood = "peaceful";
  else if (/sad|miss|alone|heavy/.test(lower)) mood = "melancholy";
  else if (/happy|joy|love|laugh/.test(lower)) mood = "joyful";
  else if (/will|focus|build|ship|done/.test(lower)) mood = "determined";

  const tags: string[] = [];
  if (/code|dev|build|ship/.test(lower)) tags.push("building");
  if (/god|pray|faith/.test(lower)) tags.push("faith");
  if (/love|heart|friend/.test(lower)) tags.push("relationships");
  if (/learn|read|study/.test(lower)) tags.push("growth");
  if (tags.length === 0) tags.push("life");

  return { title, mood, tags };
}
