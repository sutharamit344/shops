import { getApprovedShops, getCategories } from "@/lib/db";
import { slugify } from "@/lib/slugify";

import { BRAND, DOMAIN } from "@/lib/config";

export default async function sitemap() {
  const baseUrl = DOMAIN;

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/explore",
    "/create",
  ].map((route) => ({
    url: `${baseUrl}${route.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // 2. Fetch Data
    const [shops, categories] = await Promise.all([
      getApprovedShops(),
      getCategories(),
    ]);

    // 3. Dynamic Routes Sets
    const seoRoutesSet = new Set();
    const shopRoutes = [];

    shops.forEach((shop) => {
      const city = slugify(shop.city);
      const category = slugify(shop.category);
      const area = shop.area ? slugify(shop.area) : null;
      const slug = slugify(shop.slug);

      // Smart SEO Routes
      seoRoutesSet.add(`/${category}-in-${city}`);
      seoRoutesSet.add(`/${category}-near-me`);
      if (area) {
        seoRoutesSet.add(`/${category}-in-${area}`);
        if (shop.clusterType) {
          seoRoutesSet.add(`/${slugify(shop.clusterType)}-in-${area}`);
          seoRoutesSet.add(`/${slugify(shop.clusterType)}-in-${city}`);
        }
      }

      // Shop Route (keeping existing structure for compatibility)
      shopRoutes.push({
        url: `${baseUrl}/shop/${slug}`,
        lastModified: new Date(shop.updatedAt || shop.approvedAt || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    const seoEntries = Array.from(seoRoutesSet).map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...seoEntries,
      ...shopRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
