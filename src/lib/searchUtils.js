import { slugify } from "./slugify";

/**
 * Normalizes a string for search matching by:
 * 1. Slugifying and removing dashes (to handle special characters like &)
 * 2. Removing noise words like 'and', 'shops', 'services'
 * 3. Stripping intent prefixes like 'best', 'top', etc.
 */
export const normalizeForSearch = (s, isQuery = false) => {
  if (!s) return "";
  
  let normalized = slugify(s)
    .replace(/-/g, " ")
    .replace(/\band\b/g, "")
    .replace(/\bservices\b/g, "service")
    .replace(/\bshops\b/g, "shop")
    .replace(/\bshop\b/g, "")
    .replace(/\bservice\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (isQuery) {
    const prefixes = ["best ", "top ", "good ", "all ", "premium "];
    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix)) {
        normalized = normalized.replace(prefix, "").trim();
        break;
      }
    }
  }

  return normalized;
};
