/**
 * Smart Query Parsing Engine
 * Extracts category and location from natural language strings.
 */
export function parseSmartQuery(query) {
  if (!query) return { category: "", location: "", type: "all" };

  const cleanQuery = query.toLowerCase().trim().replace(/[^\w\s]/g, "");
  
  // Pattern: "{category} near me"
  if (cleanQuery.includes("near me")) {
    const category = cleanQuery.replace("near me", "").trim();
    return { category, location: "current", type: "nearby" };
  }

  // Pattern: "{category} in {location}"
  if (cleanQuery.includes(" in ")) {
    const [category, location] = cleanQuery.split(" in ").map(s => s.trim());
    return { category, location, type: "location" };
  }

  // Fallback: Try to split by space and assume last word might be a location if multiple words
  // However, simple pattern matching is more reliable for start.
  // Let's refine: check for common area/city markers or just split.
  const words = cleanQuery.split(" ");
  if (words.length > 1) {
    // Basic heuristic: check if the last word is a known city/area (optional enhancement)
    // For now, we'll stick to the "category location" pattern if no "in" is present
    // but only if it matches some common patterns.
    // Example: "restaurant ahmedabad"
    // We'll treat the first part as category and last as location for 2+ words.
    const location = words[words.length - 1];
    const category = words.slice(0, -1).join(" ");
    return { category, location, type: "location" };
  }

  return { category: cleanQuery, location: "", type: "category" };
}
