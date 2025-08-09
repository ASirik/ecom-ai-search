require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

const ALLOWED = new Set(["men's clothing", "women's clothing", "electronics", "jewelery"]);

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function normCategory(c) {
  if (!c) return "";
  const lc = String(c).trim().toLowerCase();
  return ALLOWED.has(lc) ? lc : "";
}
function stripCodeFence(s) {
  return String(s).trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

async function parseFiltersFromText(text = "") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = `
        You are a JSON extractor for an e-commerce catalog.

        Return exactly this JSON structure:
        {
          "category": string, 
          "maxPrice": number | null,
          "minRating": number | null
        }

        Mapping rules:
        - Treat "clothes", "close", "clothing", "apparel", "jacket", "coat", "t-shirt", "shirt", "jeans", "pants", "skirt", "dress", "top" as clothing.
          - If explicitly for men → "men's clothing".
          - If explicitly for women → "women's clothing".
          - If gender is not clear → "".
          - If something is not clear → ""
        - Map "ring", "bracelet", "necklace", "earrings", "jewel", "jewelry" to "jewelery".
        - Map electronics terms ("ssd", "hard drive", "monitor", "laptop", "camera", "keyboard", "mouse") to "electronics".
        - If product type does not fit the 4 categories (e.g., "shoes"), set category to "".
        - Prices are numbers, without "$".
        - If price is mentioned as "under X", "less than X", "below X" → set maxPrice = X.
        - If "above X", "more than X", "over X" → ignore (leave null unless you want minPrice).
        - minRating is only set if explicitly mentioned (e.g., "rating above 4", "4 stars or more").

        Respond with pure JSON. No explanations.

        User says: "${text}"
    `.trim();

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected OpenAI response format");
  }

  const cleaned = stripCodeFence(content);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from OpenAI: ${cleaned}`);
  }

  const category  = normCategory(parsed.category);
  const maxPrice  = toNum(parsed.maxPrice);
  const minRating = toNum(parsed.minRating);

  return { category, maxPrice, minRating };
}

module.exports = { parseFiltersFromText };
