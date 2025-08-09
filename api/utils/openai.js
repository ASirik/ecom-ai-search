require("dotenv").config();
const fetch = require("node-fetch");

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

async function parseFiltersFromText(text = "") {
    const prompt = `
        You are a JSON extractor for an e-commerce catalog.

        Return exactly this JSON structure:
        {
          "category": string,   // EXACTLY one of: "men's clothing", "women's clothing", "electronics", "jewelery", or "" (empty if unknown/not applicable)
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.error?.message || response.statusText;
    throw new Error(`OpenAI API error ${response.status}: ${errMsg}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Unexpected OpenAI response format");

  const cleaned = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

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
