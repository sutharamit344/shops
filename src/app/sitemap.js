import { getApprovedShops, getCategories } from "@/lib/db";
import { DOMAIN } from "@/lib/config";
import { slugify } from "@/lib/slugify";

export default async function sitemap() {
  // Fetch data for dynamic routes
  const shops = await getApprovedShops();
  const categories = await getCategories();

  // 1. Static Routes
  const staticRoutes = [
    {
      url: `${DOMAIN}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${DOMAIN}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${DOMAIN}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Individual Shop Routes
  const shopRoutes = shops.map((shop) => ({
    url: `${DOMAIN}/shop/${slugify(shop.slug || shop.name)}`,
    lastModified: new Date(shop.updatedAt || shop.approvedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Location & Category Discovery Routes
  const cities = [...new Set(shops.map((s) => s.city))].filter(Boolean);
  
  // /[city]
  const cityRoutes = cities.map((city) => ({
    url: `${DOMAIN}/${slugify(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // /[city]/[category]
  const cityCategoryRoutes = [];
  cities.forEach((city) => {
    categories.forEach((cat) => {
      // Only include if at least one shop exists in this city/category combo
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

  // /[city]/[area]
  const cityAreaRoutesMap = new Map();
  shops.forEach((s) => {
    if (s.city && s.area) {
      const url = `${DOMAIN}/${slugify(s.city)}/${slugify(s.area)}`;
      if (!cityAreaRoutesMap.has(url)) {
        cityAreaRoutesMap.set(url, {
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  });
  const cityAreaRoutes = Array.from(cityAreaRoutesMap.values());

  // /[city]/[area]/[category]
  const deepRoutesMap = new Map();
  shops.forEach((s) => {
    if (s.city && s.area && s.category) {
      const url = `${DOMAIN}/${slugify(s.city)}/${slugify(s.area)}/${slugify(s.category)}`;
      if (!deepRoutesMap.has(url)) {
        deepRoutesMap.set(url, {
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.5,
        });
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

    return {
      url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  // 5. Blog Routes
  const { getBlogs } = await import("@/lib/db");
  const blogs = await getBlogs(100);
  const blogRoutes = blogs.map((blog) => ({
    url: `${DOMAIN}/blog/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
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
