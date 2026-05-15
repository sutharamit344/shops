import { slugify } from "./slugify";

/**
 * Intelligent Search Engine with Fuzzy Matching and Ranking
 */

const LEVENSHTEIN_THRESHOLD = 2; // Allow up to 2 character differences

function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Find the closest matching word from a vocabulary
 */
export function autocorrectWord(word, vocabulary) {
  if (!word || word.length < 3) return word;
  const w = word.toLowerCase();
  
  let bestMatch = word;
  let minDistance = 3; // Max allowable distance

  for (const term of vocabulary) {
    const t = term.toLowerCase();
    if (t === w) return term; // Exact match
    if (t.startsWith(w)) return word; // Don't autocorrect if it's a prefix of a valid term

    const distance = getLevenshteinDistance(w, t);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = term;
    }
  }

  // Tighten threshold for short words (length 3 should only allow distance 1)
  const threshold = word.length <= 4 ? 1 : 2;
  return minDistance <= threshold ? bestMatch : word;
}

export function calculateRelevance(target, query, options = {}) {
  if (!target || !query) return 0;
  const t = target.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  const { metrics = {}, preferredLocation = "" } = options;

  let score = 0;

  if (t === q) score = 100; // Exact
  else if (t.startsWith(q)) score = 80; // Prefix
  else if (t.includes(q) || q.includes(t)) score = 50; // Substring or query contains target
  else {
    // Multi-word partial matching
    const queryWords = q.split(/\s+/);
    const targetWords = t.split(/\s+/);
    
    const allWordsMatch = queryWords.every(qw => 
      targetWords.some(tw => tw.startsWith(qw) || tw.includes(qw))
    );
    if (allWordsMatch) score = 40;
    else if (q.length > 3) {
      // Fuzzy matching for small typos
      const distance = getLevenshteinDistance(t, q);
      if (distance <= LEVENSHTEIN_THRESHOLD) score = 20;
      
      const fuzzyWordMatch = queryWords.some(qw => 
        targetWords.some(tw => getLevenshteinDistance(tw, qw) <= 1)
      );
      if (fuzzyWordMatch) score = 15;
    }
  }

  // Apply Metrics Boost (Rating & Views)
  if (score > 0 && metrics) {
    if (metrics.avgRating) score += metrics.avgRating * 2; // Up to +10
    if (metrics.totalRatings) score += Math.min(metrics.totalRatings / 10, 5); // Up to +5
  }

  // Apply Proximity Bias (Stronger boost for area match)
  if (score > 0 && preferredLocation) {
    const loc = preferredLocation.toLowerCase();
    if (t.includes(loc)) {
      score += 30; 
    }
  }

  // Pincode Exact Match
  if (options.pincode && q === options.pincode.toString()) {
    score = 110; // Higher than text match
  }

  return score;
}

/**
 * Build SEO-friendly path based on item type and context
 */
export function buildPath(item, context = {}) {
  const city = slugify(context.city || "india");
  const area = slugify(context.area || "");
  const category = slugify(item.category || item.text || "");
  const slug = slugify(item.slug || "");

  switch (item.type) {
    case "shop":
      return `/shop/${slug}`;
    case "category":
      return `/${city}/${category}`;
    case "area":
      return `/${city}/${slugify(item.text)}`;
    case "area-category":
      return `/${city}/${area}/${category}`;
    case "intent":
      if (item.area) return `/${city}/${slugify(item.area)}/${category}`;
      return `/${city}/${category}`;
    default:
      return `/${city}/${category}`;
  }
}

export function getSuggestions(query, pool, limit = 8, options = {}) {
  if (!query) return [];

  const context = {
    city: options.city || "india",
    area: options.area || ""
  };

  return pool
    .map(item => {
      const relevance = calculateRelevance(item.text, query, {
        metrics: item.metrics,
        preferredLocation: options.preferredLocation || context.city,
        pincode: item.pincode
      });

      let text = item.text;
      if (item.type === "category" || item.type === "cluster") {
        text = `${item.text} in ${context.city}`;
      }

      return {
        ...item,
        label: text,
        text: text,
        type: item.type || "category",
        path: buildPath(item, context),
        relevance
      };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * Generate high-relevance intent-based suggestions
 */
export function generateIntentSuggestions(query, pool, context = {}) {
  if (!query || query.length < 2) return [];
  const suggestions = [];
  const city = context.city && context.city.toLowerCase() !== "india" ? context.city : "Ahmedabad";
  const area = context.area || "";

  const cleanQuery = query.trim().replace(/\s+in$/i, "");
  const alreadyHasLocation = /\s+in\s+\w+/i.test(query);

  // 1. "Matched Category in Current Area" Intent - ULTIMATE PRIORITY
  const matchingCategories = pool.filter(item => 
    item.type === 'category' && 
    (item.text.toLowerCase().includes(cleanQuery.toLowerCase()) || 
     cleanQuery.toLowerCase().includes(item.text.toLowerCase()))
  );

  let hasMatchedCategoryIntent = false;

  if (matchingCategories.length > 0 && area && !alreadyHasLocation) {
    const targetCat = matchingCategories[0].text;
    suggestions.push({
      type: "intent",
      label: `${targetCat} in ${area}, ${city}`,
      text: `${targetCat} in ${area}, ${city}`,
      category: targetCat,
      area: area,
      path: buildPath({ type: "intent", text: targetCat, area }, context),
      relevance: 130 // Boost above raw query intent
    });
    hasMatchedCategoryIntent = true;
  }

  // 2. "Raw Query in Area" Intent (if area exists) - Only if no category match
  if (area && !alreadyHasLocation && !hasMatchedCategoryIntent) {
    suggestions.push({
      type: "intent",
      label: `${cleanQuery} in ${area}, ${city}`,
      text: `${cleanQuery} in ${area}, ${city}`,
      category: cleanQuery,
      area: area,
      path: buildPath({ type: "intent", text: cleanQuery, area }, context),
      relevance: 120 
    });
  }


  // 3. Dynamic "Category in [Other Areas]" from Pool
  if (matchingCategories.length > 0) {
    const targetCat = matchingCategories[0].text;
    // Find unique areas for this category from the pool
    const locations = pool.filter(item => item.type === 'location' && item.text !== area && item.text !== city);
    
    locations.slice(0, 3).forEach(loc => {
      suggestions.push({
        type: "intent",
        label: `${targetCat} in ${loc.text}`,
        text: `${targetCat} in ${loc.text}`,
        category: targetCat,
        area: loc.area,
        path: buildPath({ type: "intent", text: targetCat, area: loc.area }, context),
        relevance: 85
      });
    });
  }

  return suggestions;
}

/**
 * Final Function: Combine Intent + Matched Pool suggestions
 */
export function getSmartSuggestions(query, pool, context = {}) {
  if (!query) return [];

  // Build vocabulary from pool
  const vocabulary = Array.from(new Set(
    pool.flatMap(item => item.text.split(/\s+/))
  )).filter(w => w.length > 3);

  // Attempt to correct the query words
  const queryWords = query.trim().split(/\s+/);
  const correctedWords = queryWords.map(w => autocorrectWord(w, vocabulary));
  const correctedQuery = correctedWords.join(" ");

  const intentSuggestions = generateIntentSuggestions(correctedQuery, pool, context);
  const matchedSuggestions = getSuggestions(correctedQuery, pool, 10, {
    city: context.city || "Ahmedabad",
    area: context.area,
    preferredLocation: context.area || context.city || "Ahmedabad"
  });

  // If corrected query is different, add a "Did you mean" style suggestion if results are good
  if (correctedQuery.toLowerCase() !== query.toLowerCase() && matchedSuggestions.length > 0) {
     // We can boost these or just use them
  }

  const all = [...intentSuggestions, ...matchedSuggestions];
  
  // Remove duplicates based on path
  const seen = new Set();
  return all
    .filter(item => {
      if (seen.has(item.path)) return false;
      seen.add(item.path);
      return true;
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

/**
 * Generate default suggestions when query is empty
 */
export function getDefaultSuggestions(categories = [], context = {}, recentSearches = []) {
  const city = context.city && context.city.toLowerCase() !== "india" ? context.city : "Ahmedabad";
  const area = context.area || "";
  
  const suggestions = [];

  // 1. Recent Searches (Highest Priority)
  recentSearches.slice(0, 3).forEach(term => {
    suggestions.push({
      type: "history",
      label: term,
      text: term,
      relevance: 200
    });
  });

  // 2. All Categories × Current Location (always show rich suggestions)
  categories.forEach((cat, i) => {
    if (area) {
      // Show: "Electronics in Gota, Ahmedabad"
      suggestions.push({
        type: "category",
        label: `${cat.name} in ${area}, ${city}`,
        text: `${cat.name} in ${area}, ${city}`,
        category: cat.name,
        path: buildPath({ type: "area-category", category: cat.name }, { city, area }),
        relevance: 100 - i
      });
    }
    // Always also show: "Electronics in Ahmedabad"
    suggestions.push({
      type: "category",
      label: `${cat.name} in ${city}`,
      text: `${cat.name} in ${city}`,
      category: cat.name,
      path: buildPath({ type: "category", text: cat.name }, { city }),
      relevance: 90 - i
    });
  });

  // 3. Other cities (only if no area selected)
  if (!area) {
    ["Surat", "Rajkot", "Vadodara"].forEach(c => {
      if (c.toLowerCase() !== city.toLowerCase()) {
        suggestions.push({
          type: "location",
          label: `Shops in ${c}`,
          text: `Shops in ${c}`,
          city: c,
          path: `/${slugify(c)}`,
          relevance: 50
        });
      }
    });
  }

  // Deduplicate by text
  const seen = new Set();
  return suggestions.filter(s => {
    const key = s.text?.toLowerCase()?.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

