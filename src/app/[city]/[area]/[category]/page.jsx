import DiscoveryClient from "@/components/Search/DiscoveryClient";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import { notFound } from "next/navigation";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, area, category } = await params;
  const parsed = parseDiscoveryPath({ city, area, category });
  
  if (!parsed) return null;

  const location = parsed.location || `${area.replace(/-/g, " ")}, ${city.replace(/-/g, " ")}`;
  const catLabel = parsed.category || category.replace(/-/g, " ");
  
  const title = `${catLabel.charAt(0).toUpperCase() + catLabel.slice(1)} in ${location.charAt(0).toUpperCase() + location.slice(1)} | ${BRAND}`;

  return {
    title,
    description: `Discover best ${catLabel} in ${location}, ${city}. Ratings, locations, and contact info on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${city}/${area}/${category}`,
    }
  };
}

export default async function DeepDiscoveryPage({ params }) {
  const { city, area, category } = await params;
  
  const parsed = parseDiscoveryPath({ city, area, category });

  if (!parsed) return notFound();

  return (
    <DiscoveryClient slug={`${city}/${area}/${category}`} parsed={parsed} />
  );
}
