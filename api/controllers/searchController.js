const { parseFiltersFromText } = require("../utils/openai");
const products = require("../data/products.json");

const ALLOWED = new Set(["men's clothing", "women's clothing", "electronics", "jewelery"]);
const CLOTHES_KEYWORDS = ["clothes","close","clothing","apparel","t-shirt","shirt","tee","hoodie","jacket","coat","jeans","pants","skirt","dress","top"];

const toNum = (v) => (v == null || v === "" ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const normCat = (c) => (c ? (ALLOWED.has(String(c).toLowerCase()) ? String(c).toLowerCase() : "") : "");

const STOP = new Set(["show","me","under","below","less","than","over","more","with","rating","above","all","the","a","an","for","$","usd"]);
function extractKeywords(q) {
  return String(q || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => !STOP.has(w));
}

async function nlpSearch(req, res, next) {
    try {
        const { query } = req.body || {};
        if (typeof query !== "string") return res.status(400).json({ error: "`query` must be a string" });

        const raw = await parseFiltersFromText(query);
        const category  = normCat(raw.category);
        const maxPrice  = toNum(raw.maxPrice);
        const minRating = toNum(raw.minRating);

        const qLower = query.toLowerCase();
        const isGenericClothes = CLOTHES_KEYWORDS.some(k => qLower.includes(k));
        const tokens = extractKeywords(query);
        const enforceKeywordMatch = !category && !isGenericClothes && tokens.length > 0;

        const list = products.filter((p) => {
            const prodCat = String(p.category || "").toLowerCase();
            const title = String(p.title || "").toLowerCase();
            const desc  = String(p.description || "").toLowerCase();

            if (isGenericClothes && !category && prodCat !== "men's clothing" && prodCat !== "women's clothing") {
                return false;
            }

            const okCat   = !category || prodCat === category;
            const okPrice = maxPrice == null || Number(p.price) <= maxPrice;

            const rateObj = p?.rating && typeof p.rating === "object" ? Number(p.rating.rate) : Number(p.rating);
            const okRate  = minRating == null || (Number.isFinite(rateObj) && rateObj >= minRating);

            const okKeyword = !enforceKeywordMatch || tokens.some(t => title.includes(t) || desc.includes(t));

            return okCat && okPrice && okRate && okKeyword;
        });

        res.json(list);
    } catch (err) {
        next(err);
    }
}

module.exports = { nlpSearch };
