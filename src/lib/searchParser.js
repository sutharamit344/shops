export function parseSmartQuery(query, knownClusters = []) {
  if (!query)
    return { category: "", location: "", clusterType: "", type: "all" };

  // 1. Normalization
  let normalized = query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");

  // Words that should NEVER be misinterpreted as a location
  const LOCATION_BLACKLIST = [
    "shops",
    "shop",
    "services",
    "service",
    "best",
    "near",
    "top",
    "good",
    "all",
    "market",
    "hub",
    "park",
    "center",
    "plaza",
    "square",
    "mall",
  ];

  // Combine static defaults with dynamic clusters from DB
  const STATIC_CLUSTERS = [
    "education hub",
    "food park",
    "street food",
    "electronics market",
    "fashion hub",
    "beauty wellness",
    "it service",
    "home service",
    "auto repair",
    "medical center",
    "shopping mall",
    "business platform",
  ];
  
  const ALL_CLUSTERS = [...new Set([...STATIC_CLUSTERS, ...knownClusters.map(c => c.toLowerCase())])];

  const queryTokens = normalized.split(/\s+/).filter(Boolean);

  // 2. Pre-process "Best" intent
  let isBestSearch = false;
  let processingQuery = normalized;
  if (normalized.startsWith("best ")) {
    isBestSearch = true;
    processingQuery = normalized.replace(/^best\s+/, "").trim();
  }

  // 3. Cluster Detection (Exact & Token-Based)
  const sortedClusters = [...ALL_CLUSTERS].sort((a, b) => b.length - a.length);

  for (const cluster of sortedClusters) {
    if (processingQuery.includes(cluster)) {
      const remaining = processingQuery.replace(cluster, "").trim();
      const location = remaining.replace(/^in\s+/, "").trim();

      // Safety check: don't let blacklisted words become locations
      if (LOCATION_BLACKLIST.includes(location)) {
        return {
          category: cluster,
          location: "",
          clusterType: cluster,
          type: "category",
        };
      }

      return {
        category: cluster,
        location,
        clusterType: cluster,
        type: location ? "location" : "category",
      };
    }
  }

  // 4. Pattern: "{category} near me"
  if (normalized.includes("near me")) {
    let category = normalized.replace("near me", "").trim();
    // Strip trailing "in" if user typed "cafe in near me"
    if (category.endsWith(" in")) {
      category = category.slice(0, -3).trim();
    }
    return { category, location: "current", clusterType: "", type: "nearby" };
  }

  // 5. Pattern: "{category} in {location}"
  if (normalized.includes(" in ")) {
    const parts = normalized.split(" in ");
    const category = parts[0].trim();
    const location = parts.slice(1).join(" in ").trim();
    return { category, location, clusterType: "", type: "location" };
  }

  // 6. Intelligent Fallback Split
  if (queryTokens.length >= 3) {
    const lastWord = queryTokens[queryTokens.length - 1];

    // If the last word is in the blacklist, it's not a location (e.g., "Best Cafe Shops")
    if (LOCATION_BLACKLIST.includes(lastWord)) {
      return {
        category: normalized,
        location: "",
        clusterType: "",
        type: "category",
      };
    }

    // Heuristic: If 3+ words and no "in", treat last word as location
    const location = lastWord;
    const category = queryTokens.slice(0, -1).join(" ");
    return { category, location, clusterType: "", type: "location" };
  }

  // Single or Two-word phrases are treated as category by default
  return {
    category: normalized,
    location: "",
    clusterType: "",
    type: "category",
  };
}
