// Stateless text-in/JSON-out transform: parses pasted Lagree class notes into
// candidate workout blocks via OpenAI. Never touches the database — all writes
// happen client-side through the normal Supabase mutations under the user's
// own session. Requires the OPENAI_API_KEY secret (never exposed to the client).
//
// Supabase's default JWT verification accepts the public anon key as a valid
// token (it's a signed JWT too), so it alone does NOT prove the caller is a
// logged-in user. We explicitly resolve the caller via auth.getUser() below
// so an anonymous visitor who only has the public anon key can't spend
// OpenAI credits through this endpoint.
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  text: string;
  existingExercises: { name: string; category: string | null }[];
}

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    workoutName: { type: ["string", "null"] },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          rawSourceLine: { type: "string" },
          exerciseName: { type: "string" },
          matchedExistingName: { type: ["string", "null"] },
          category: { type: ["string", "null"], enum: ["Glute Ramp", "Reformer", null] },
          durationSeconds: { type: ["number", "null"] },
          side: { type: "string", enum: ["left", "right", "both", "none"] },
          notes: { type: ["string", "null"] },
          needsReview: { type: "boolean" },
          reviewReason: { type: ["string", "null"] },
        },
        required: [
          "rawSourceLine",
          "exerciseName",
          "matchedExistingName",
          "category",
          "durationSeconds",
          "side",
          "notes",
          "needsReview",
          "reviewReason",
        ],
      },
    },
  },
  required: ["workoutName", "blocks"],
};

function buildSystemPrompt(
  existingExercises: { name: string; category: string | null }[],
): string {
  const libraryList =
    existingExercises.length > 0
      ? existingExercises.map((e) => `- ${e.name}`).join("\n")
      : "(none yet)";

  return `You convert a Lagree Megaformer instructor's shorthand class notes into structured workout data.

Conventions used in the source text:
- A line may start with an equipment prefix: "GR" means Glute Ramp, a bare "R" means Reformer/carriage. Map these to the "category" field ("Glute Ramp" or "Reformer"). If there's no prefix, infer category from context if it's obvious, otherwise null.
- The number(s) after an exercise name are MINUTES, not reps or sets. Convert to seconds (minutes * 60) for "durationSeconds".
- Some lines describe several distinct timed movements packed together (dash-separated clauses, or multiple "<number> <movement name>" pairs in a row). Split these into one block per timed movement, each with its own slice of the time and its own exerciseName that combines the parent move with the variation (e.g. "Escalator lunge - hold", "Escalator lunge - moonwalker"). The per-movement durations should add up to the number(s) stated on the line.
- A line that names a movement but has NO number at all (e.g. a bare "Legs", "Obliques", or a trailing "GR plank" with nothing else) should still be emitted as its own block, with durationSeconds: null, needsReview: true, and reviewReason: "missing duration".
- Blank lines just separate groups of exercises and carry no data of their own.
- Preserve the order exercises appear in the source text.
- For exerciseName, return a clean, human-readable name (strip equipment prefixes like "GR"/"R" and the numbers) but stay close to the instructor's original wording.
- side should be "none" unless the text clearly states a left/right split.
- For each block, try to match exerciseName against the user's existing exercise library below (case- and whitespace-insensitive). Set matchedExistingName to the exact existing name only if you're reasonably confident it's the same exercise, otherwise null.
- The first line is often a title/date like "Lagree 6/13" — use it (lightly cleaned up) as workoutName, or null if there's no clear title line.

The user's existing exercise library:
${libraryList}

Respond only with the structured JSON object described by the schema. Do not include commentary.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured for this function");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, existingExercises }: RequestBody = await req.json();
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(existingExercises ?? []) },
          { role: "user", content: text },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "parsed_workout_import",
            strict: true,
            schema: RESPONSE_JSON_SCHEMA,
          },
        },
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      throw new Error(`OpenAI request failed (${openaiRes.status}): ${errBody}`);
    }

    const completion = await openaiRes.json();
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI response had no content");
    }

    return new Response(content, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
