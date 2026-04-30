import DiscoveryClient from "./DiscoveryClient";
import { parseDiscoverySlug } from "@/lib/urlArchitect";

export const dynamic = "force-dynamic";

import { BRAND, DOMAIN } from "@/lib/config";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const parsed = parseDiscoverySlug(slug);
  
  if (!parsed) return null;

  const { category, location, type } = parsed;
  let title = "";
  if (type === "nearby") title = `${category} Near Me`;
  else if (location) title = `Best ${category} in ${location}`;
  else title = `${category.charAt(0).toUpperCase() + category.slice(1)}`;

  const fullTitle = `${title} | ${BRAND} Marketplace`;

  return {
    title: fullTitle,
    description: `Discover top ${category} in your area. Smart discovery for local shops on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${slug}`,
    },
    openGraph: {
      title: fullTitle,
      url: `${DOMAIN}/${slug}`,
      siteName: BRAND,
    }
  };
}

export default async function DiscoverySlugPage({ params }) {
  const { slug } = await params;
  const parsed = parseDiscoverySlug(slug);

  if (!parsed) return notFound();

  return <DiscoveryClient slug={slug} parsed={parsed} />;
}
