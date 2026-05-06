import { slugify } from "./slugify";
export { slugify };

/**
 * URL Architect for SEO-friendly dynamic URLs
 * Strictly follows:
 * /[city]
 * /[city]/[category]
 * /[city]/[area]
 * /[city]/[area]/[category]
 */
export function generateDiscoveryUrl(category, location, type = "all", area = "") {
  const citySlug = location ? slugify(location) : "india";
  const areaSlug = area ? slugify(area) : "";
  const catSlug = category ? slugify(category) : "";

  // /[city]/[area]/[category]
  if (citySlug && areaSlug && catSlug) {
    return `/${citySlug}/${areaSlug}/${catSlug}`;
  }

  // /[city]/[area]
  if (citySlug && areaSlug) {
    return `/${citySlug}/${areaSlug}`;
  }

  // /[city]/[category]
  if (citySlug && catSlug) {
    return `/${citySlug}/${catSlug}`;
  }

  // /[city]
  if (citySlug) {
    return `/${citySlug}`;
  }

  return "/";
}

export function parseDiscoveryPath(params) {
  const { city, area, category, slug } = params;

  // Case 3: /[city]/[area]/[category]
  if (city && area && category) {
    return {
      category: category.replace(/-/g, " "),
      location: `${area.replace(/-/g, " ")}, ${city.replace(/-/g, " ")}`,
      city: city.replace(/-/g, " "),
      area: area.replace(/-/g, " "),
      type: "hierarchical"
    };
  }

  // Case: /[city]/[area] (No Category)
  if (city && area && !category) {
    return {
      category: "",
      location: `${area.replace(/-/g, " ")}, ${city.replace(/-/g, " ")}`,
      city: city.replace(/-/g, " "),
      area: area.replace(/-/g, " "),
      type: "hierarchical"
    };
  }

  // Case 2: /[city]/[sub] (sub can be area or category)
  if (city && category) {
    return {
      category: category.replace(/-/g, " "),
      location: city.replace(/-/g, " "),
      city: city.replace(/-/g, " "),
      type: "city-sub"
    };
  }

  // Case 1: /[city] or /[area-city]
  if (slug) {
    const parts = slug.split("-");
    if (parts.length > 1) {
      // Handle gota-ahmedabad style
      const areaPart = parts[0].replace(/-/g, " ");
      const cityPart = parts.slice(1).join(" ").replace(/-/g, " ");
      return {
        category: "",
        location: `${areaPart}, ${cityPart}`,
        city: cityPart,
        area: areaPart,
        type: "hierarchical"
      };
    }
    
    if (slug === "explore") {
      return {
        category: "",
        location: "",
        city: "",
        area: "",
        type: "all"
      };
    }
    
    const decoded = slug.replace(/-/g, " ");
    return {
      category: "",
      location: decoded,
      city: decoded,
      type: "city-hub"
    };
  }

  return null;
}

export function generateShopUrl(shop) {
  if (!shop || !shop.slug) return "/";
  return `/shop/${slugify(shop.slug)}`;
}
