import { slugify } from "./slugify";

/**
 * URL Architect for SEO-friendly dynamic URLs
 */
export function generateDiscoveryUrl(category, location, type = "all") {
  const catSlug = slugify(category || "shops");
  const locSlug = slugify(location);

  if (type === "nearby") {
    return `/${catSlug}-near-me`;
  }

  if (locSlug) {
    return `/${catSlug}-in-${locSlug}`;
  }

  return `/${catSlug}`;
}

export function parseDiscoverySlug(slug) {
  if (!slug) return null;

  // Pattern: {category}-near-me
  if (slug.endsWith("-near-me")) {
    const category = slug.replace("-near-me", "").replace(/-/g, " ");
    return { category, location: "current", type: "nearby" };
  }

  // Pattern: {category}-in-{location}
  if (slug.includes("-in-")) {
    const [catSlug, locSlug] = slug.split("-in-");
    const category = catSlug.replace(/-/g, " ");
    const location = locSlug.replace(/-/g, " ");
    return { category, location, type: "location" };
  }

  // Pattern: {category}
  const category = slug.replace(/-/g, " ");
  return { category, location: "", type: "category" };
}
