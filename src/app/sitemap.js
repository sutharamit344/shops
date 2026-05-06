import { getApprovedShops, getCategories } from "@/lib/db";
import { DOMAIN } from "@/lib/config";
import { slugify } from "@/lib/slugify";

// Safely converts Firestore Timestamps, epoch ms, ISO strings, or null to a Date.
// Falls back to now() for any invalid value to prevent build-breaking RangeErrors.
function safeDate(value) {
  if (!value) return new Date();
  // Firestore Timestamp object
  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap() {
  const shops = await getApprovedShops();
  const categories = await getCategories();

  // 1. Static Routes
  const staticRoutes = [
    { url: `${DOMAIN}/`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${DOMAIN}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${DOMAIN}/terms`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${DOMAIN}/blog`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${DOMAIN}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // 2. Individual Shop Routes
  const shopRoutes = shops.map((shop) => ({
    url: `${DOMAIN}/shop/${slugify(shop.slug || shop.name)}`,
    lastModified: safeDate(shop.updatedAt || shop.approvedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Location & Category Discovery Routes
  const cities = [...new Set(shops.map((s) => s.city))].filter(Boolean);

  const cityRoutes = cities.map((city) => ({
    url: `${DOMAIN}/${slugify(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const cityCategoryRoutes = [];
  cities.forEach((city) => {
    categories.forEach((cat) => {
      const exists = shops.some(s => s.city === city && s.category === cat.name);
      if (exists) {
        cityCategoryRoutes.push({
          url: `${DOMAIN}/${slugify(city)}/${slugify(cat.name)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });
  });

  const cityAreaRoutesMap = new Map();
  shops.forEach((s) => {
    if (s.city && s.area) {
      const url = `${DOMAIN}/${slugify(s.city)}/${slugify(s.area)}`;
      if (!cityAreaRoutesMap.has(url)) {
        cityAreaRoutesMap.set(url, { url, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
      }
    }
  });
  const cityAreaRoutes = Array.from(cityAreaRoutesMap.values());

  const deepRoutesMap = new Map();
  shops.forEach((s) => {
    if (s.city && s.area && s.category) {
      const url = `${DOMAIN}/${slugify(s.city)}/${slugify(s.area)}/${slugify(s.category)}`;
      if (!deepRoutesMap.has(url)) {
        deepRoutesMap.set(url, { url, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 });
      }
    }
  });
  const deepRoutes = Array.from(deepRoutesMap.values());

  // 4. Cluster Routes
  const { getClusters } = await import("@/lib/db");
  const clusters = await getClusters();
  const clusterRoutes = clusters.map((cluster) => {
    const city = cluster.city || "ahmedabad";
    const area = cluster.area || "";
    const url = area
      ? `${DOMAIN}/${slugify(city)}/${slugify(area)}/${slugify(cluster.name)}`
      : `${DOMAIN}/${slugify(city)}/${slugify(cluster.name)}`;
    return { url, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 };
  });

  // 5. Blog Routes
  const { getBlogs } = await import("@/lib/db");
  const blogs = await getBlogs(100);
  const blogRoutes = blogs.map((blog) => ({
    url: `${DOMAIN}/blog/${blog.slug}`,
    lastModified: safeDate(blog.updatedAt || blog.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...shopRoutes,
    ...cityRoutes,
    ...cityCategoryRoutes,
    ...cityAreaRoutes,
    ...deepRoutes,
    ...clusterRoutes,
    ...blogRoutes,
  ];
}

