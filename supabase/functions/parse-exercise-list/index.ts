// Stateless text-in/JSON-out transform: parses pasted exercise-catalog text
// (section headers, equipment defaults, "(also reverse, giant reverse, giant)"
// style variation shorthand) into candidate exercise-library entries via
// OpenAI. Never touches the database — all writes happen client-side through
// the normal Supabase mutations under the user's own session. Requires the
// OPENAI_API_KEY secret (never exposed to the client).
//
// See parse-workout/index.ts for why we explicitly resolve the caller via
// auth.getUser() instead of relying on Supabase's default JWT verification
// (which also accepts the public anon key).
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
  existingExercises: { name: string }[];
}

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    sectionLabel: { type: ["string", "null"] },
    exercises: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          matchedExistingName: { type: ["string", "null"] },
          muscleGroups: { type: ["array", "null"], items: { type: "string" } },
          category: { type: ["string", "null"] },
          difficulty: {
            type: ["string", "null"],
            enum: ["beginner", "intermediate", "advanced", null],
          },
          notes: { type: ["string", "null"] },
          needsReview: { type: "boolean" },
          reviewReason: { type: ["string", "null"] },
        },
        required: [
          "name",
          "matchedExistingName",
          "muscleGroups",
          "category",
          "difficulty",
          "notes",
          "needsReview",
          "reviewReason",
        ],
      },
    },
  },
  required: ["sectionLabel", "exercises"],
};

function buildSystemPrompt(existingExercises: { name: string }[]): string {
  const libraryList =
    existingExercises.length > 0
      ? existingExercises.map((e) => `- ${e.name}`).join("\n")
      : "(none yet)";

  return `You convert a Lagree instructor's shorthand exercise-catalog notes into a structured list of exercise-library entries (NOT a timed workout — there are no durations here).

STRUCTURE
- The text may contain multiple sections separated by blank lines. The line immediately after a blank line (or the very first line) that is short and reads like a focus-area name (e.g. "Center Core", "Legs", "Obliques", "Arms") is a SECTION LABEL, not an exercise. Use the most recent section label as the default "muscleGroups" for exercises below it (e.g. "Legs" → ["Legs"]) until a new section label appears.
- A bare body-area word or short phrase (e.g. "Legs", "Obliques", "Arms", "Core", "Back", "Glutes", "Shoulders", "Center Core") that is the very first line right after a blank line is ALWAYS a section label, with no exceptions and no ambiguity — treat every later one exactly the same way you treat the first one ("Center Core"): silently consume it to update the current muscleGroups default, and do NOT put it in the "exercises" array, ever, even with needsReview: true. This rule applies no matter how many times such a line repeats through the document.
- Only the very first section label in the whole document is also echoed back as the top-level "sectionLabel" field; later ones just silently update the per-exercise muscleGroups default and are otherwise discarded.
- A short line that states a default spring/equipment load for what follows — e.g. "All 1 yellow spring unless otherwise noted", "Light arms - 3-5 yellow springs unless otherwise noted", "Heavy arms - 1 red 1-2 yellow springs unless otherwise noted", "Giant Arms - all 2 yellow springs, using short gray/red cables off back" — is a SUB-GROUP DEFAULT line, not an exercise. It sets the default "notes" value (the spring/equipment description, e.g. "1 red 1-2 yellow springs") for every exercise below it, replacing any earlier default, until the next sub-group default or section label appears. Do not emit sub-group default lines as exercises themselves.
- A bare one or two-word line with no spring info and no recognizable movement (e.g. "Heavy Legs", "Kneeling", "Seated (Legs Criss-Crossed)", "Tailbone", "Forward Facing Tailbone" when it stands alone with nothing else on the line) is ambiguous between a sub-heading and an exercise name — use your judgment from context (is it a known bodyweight position/movement on its own, or clearly just a label?). If genuinely unsure, still emit it as an exercise but set needsReview: true with a short reviewReason.

PER-EXERCISE SPRING OVERRIDES
- A line ending in "- <spring spec>" (e.g. "Side Kick - 1 red, 1-2 yellow", "Froggy Kick - 3-4 yellow") sets "notes" to that spring spec for that exercise specifically, REPLACING the inherited section/sub-group default rather than combining with it.
- A line with no spring spec of its own inherits the current default notes value as-is.

VARIATION EXPANSION
- A line naming one or more base movements (optionally joined with "&"), followed by a parenthetical list of variation words — whether phrased as "(also <variation>, <variation>, ...)", "(<variation>, <variation>, ...)" with no "also", or "+ variations (also ...)" — expands into ONE exercise per combination of base name × variation, named as "<Variation> <Base name>". Always include each unmodified base name as one of the entries too. Recognize common variation words like "reverse", "giant", "giant reverse" even when "also" is omitted (e.g. "Hamstring curls (reverse, giant reverse, giant)" expands exactly like "Hamstring curls (also reverse, giant reverse, giant)" would).
  - This expansion is MECHANICAL: a line with N base names and M variations always produces exactly N + (N × M) exercises. Never skip a combination, and never set needsReview just because a line has multiple base names or a variation list — that pattern is common and expected.
  - Worked example: "Wheelbarrow (also reverse, giant reverse, giant)" has 1 base name and 3 variations → exactly 4 exercises: "Wheelbarrow", "Reverse Wheelbarrow", "Giant Reverse Wheelbarrow", "Giant Wheelbarrow".
  - Worked example: "Plank & Forearm Plank and variations (also reverse, giant reverse, giant)" has 2 base names and 3 variations → exactly 8 exercises: "Plank", "Forearm Plank", "Reverse Plank", "Giant Reverse Plank", "Giant Plank", "Reverse Forearm Plank", "Giant Reverse Forearm Plank", "Giant Forearm Plank".
  - If the parenthetical explicitly limits which variations exist (e.g. "(giant and giant reverse versions only. No kneeling crunches at the front of the machine)"), only generate the named subset (here: just the "giant" and "giant reverse" forms, not the unmodified base or a plain "reverse" form) and put the rest of the parenthetical text in "notes" as a clarifying note.
- "/" between two phrases names two specific exercises directly (not a base+variation expansion) — emit each "/"-separated phrase as its own exercise, e.g. "Catfish/Giant Reverse catfish" → "Catfish" and "Giant Reverse Catfish".

NON-VARIATION PARENTHETICALS (do NOT expand into multiple exercises)
- Parenthetical text that is NOT the "(also ...)" pattern is descriptive, not a variation trigger — append it to that exercise's "notes" instead (after the spring spec if any, separated with " — "). This covers: anatomical/setup detail ("(working leg on front platform, non-working toes on carriage)"), caveats ("(no clamshell variation in Megadonkey, please)"), modifications ("(2Y beginner modification, 4Y advanced modification)"), context ("(can add crunch)", "(cables uncrossed - can use footstraps or handles)", "(short cables)", "(carriage or platform)", "(turns into Reverse Tailbone Angel when legs are lifted)").
- "(aka <name>)" or "(aka <name>, ...)" gives an alternate name for the SAME exercise — do not create a separate exercise for it. Instead add "Also known as: <name>" to that exercise's notes. If the same parenthetical also contains other clarifying text after the aka part, append that too.

GENERAL
- Preserve the order exercises appear in the source text.
- For each exercise, try to match its name against the user's existing exercise library below (case- and whitespace-insensitive, allowing for minor wording differences). Set matchedExistingName to the exact existing name only if you're reasonably confident it's the same exercise, otherwise null.
- Leave "category" null unless the text clearly names specific equipment stations (e.g. "Glute Ramp", "Reformer") for that exercise — never use it for muscle groups or spring loads.
- Leave "difficulty" null unless the text explicitly states a difficulty level.
- Reserve needsReview for genuine uncertainty only (e.g. unclear whether a bare line is a heading or an exercise, or which line a variation list belongs to). Routine expansion and note-building as described above is never itself a reason for needsReview.

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
        max_tokens: 16000,
        messages: [
          { role: "system", content: buildSystemPrompt(existingExercises ?? []) },
          { role: "user", content: text },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "parsed_exercise_list",
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
    const finishReason = completion.choices?.[0]?.finish_reason;
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI response had no content");
    }
    if (finishReason && finishReason !== "stop") {
      throw new Error(
        "The list was too long to parse in one go (it got cut off partway through). Try pasting a smaller section at a time.",
      );
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
