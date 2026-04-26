import { slugify } from "./slugify";

/**
 * URL Architect for SEO-friendly dynamic URLs
 */
export function generateDiscoveryUrl(category, location, type = "all", clusterType = "") {
  const base = clusterType || category || "shops";
  const baseSlug = slugify(base);
  
  if (type === "nearby") {
    return `/${baseSlug}-near-me`;
  }

  if (location && location !== "all") {
    return `/${baseSlug}-in-${slugify(location)}`;
  }

  return `/${baseSlug}`;
}

export function parseDiscoverySlug(slug) {
  if (!slug) return null;

  // Pattern: {base}-near-me
  if (slug.endsWith("-near-me")) {
    const base = slug.replace("-near-me", "").replace(/-/g, " ");
    return { category: base, location: "current", type: "nearby", clusterType: "" };
  }

  // Pattern: {base}-in-{location}
  if (slug.includes("-in-")) {
    const [baseSlug, locSlug] = slug.split("-in-");
    const base = baseSlug.replace(/-/g, " ");
    const location = locSlug === "all" ? "" : locSlug.replace(/-/g, " ");
    
    // Check if base is a known cluster (simplified check)
    const isCluster = base.includes("hub") || base.includes("park") || base.includes("market") || base.includes("food");
    
    return { 
      category: isCluster ? base.split(" ")[0] : base, 
      location: location, 
      type: location ? "location" : "category",
      clusterType: isCluster ? base : ""
    };
  }

  // Pattern: {base}
  const base = slug.replace(/-/g, " ");
  
  // Check if base is a known cluster (simplified check)
  const isCluster = base.includes("hub") || base.includes("park") || base.includes("market") || base.includes("food");
  
  return { 
    category: isCluster ? base.split(" ")[0] : base, 
    location: "", 
    type: "category", 
    clusterType: isCluster ? base : "" 
  };
}

export function generateShopUrl(shop) {
  if (!shop || !shop.slug) return "/";
  return `/shop/${slugify(shop.slug)}`;
}
