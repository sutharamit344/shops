import DiscoveryClient from "@/components/Search/DiscoveryClient";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import { notFound } from "next/navigation";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, area } = await params;
  const parsed = parseDiscoveryPath({ city, area });
  
  if (!parsed) return null;

  const location = parsed.location || city.replace(/-/g, " ");
  const label = parsed.category || area.replace(/-/g, " ");
  
  const title = `${label.charAt(0).toUpperCase() + label.slice(1)} in ${location.charAt(0).toUpperCase() + location.slice(1)} | ${BRAND}`;

  return {
    title,
    description: `Find top-rated ${label} in ${location}. Verified contact details and locations on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${city}/${area}`,
    }
  };
}

export default async function CityDiscoveryPage({ params }) {
  const { city, area } = await params;
  
  // Pass city and area explicitly to the parser
  const parsed = parseDiscoveryPath({ city, area });

  if (!parsed) return notFound();

  return (
    <DiscoveryClient slug={`${city}/${area}`} parsed={parsed} />
  );
}
