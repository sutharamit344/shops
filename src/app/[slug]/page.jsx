import DiscoveryClient from "./DiscoveryClient";
import { parseDiscoverySlug } from "@/lib/urlArchitect";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const parsed = parseDiscoverySlug(slug);
  
  if (!parsed) return { title: "Explore Marketplace | ShopSetu" };

  const { category, location, type } = parsed;
  let title = "";
  if (type === "nearby") title = `${category} Near Me`;
  else if (location) title = `Best ${category} in ${location}`;
  else title = `${category.charAt(0).toUpperCase() + category.slice(1)}`;

  return {
    title: `${title} | ShopSetu Marketplace`,
    description: `Discover top ${category} in your area. Smart discovery for local shops.`
  };
}

export default async function DiscoverySlugPage({ params }) {
  const { slug } = await params;
  const parsed = parseDiscoverySlug(slug);

  if (!parsed) return null;

  return <DiscoveryClient slug={slug} parsed={parsed} />;
}
