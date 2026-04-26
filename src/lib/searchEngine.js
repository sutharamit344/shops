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

export function calculateRelevance(target, query, options = {}) {
  if (!target || !query) return 0;
  const t = target.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  const { metrics = {}, preferredLocation = "" } = options;

  let score = 0;

  if (t === q) score = 100; // Exact
  else if (t.startsWith(q)) score = 80; // Prefix
  else if (t.includes(q)) score = 50; // Substring
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

  // Apply Proximity Bias
  if (score > 0 && preferredLocation && t.includes(preferredLocation.toLowerCase())) {
    score += 15;
  }

  return score;
}

export function getSuggestions(query, pool, limit = 8, options = {}) {
  if (!query) return [];

  return pool
    .map(item => ({
      ...item,
      relevance: calculateRelevance(item.text, query, {
        metrics: item.metrics,
        preferredLocation: options.preferredLocation
      })
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}
