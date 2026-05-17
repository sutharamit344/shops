import DiscoveryClient from "@/components/Search/DiscoveryClient";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import { notFound } from "next/navigation";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city } = await params;
  const parsed = parseDiscoveryPath({ slug: city });
  
  if (!parsed) return null;

  const location = parsed.location || city.replace(/-/g, " ");
  const title = `Discover shops in ${location.charAt(0).toUpperCase() + location.slice(1)} | ${BRAND}`;

  return {
    title,
    description: `Explore the best local shops and services in ${location}. Verified businesses on ${BRAND} Marketplace.`,
    alternates: {
      canonical: `${DOMAIN}/${city}`,
    }
  };
}

export default async function CityHubPage({ params }) {
  const { city } = await params;
  console.time(`CityHubPage-${city}`);
  const parsed = parseDiscoveryPath({ slug: city });
  console.log(`[Server] CityHubPage parsed slug "${city}":`, parsed);
  console.timeEnd(`CityHubPage-${city}`);

  if (!parsed) return notFound();

  const locationName = parsed.location || city.replace(/-/g, " ");
  const formattedLocation = locationName.charAt(0).toUpperCase() + locationName.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Discover shops in ${formattedLocation}`,
    "description": `Explore the best local shops and services in ${formattedLocation}. Verified businesses on ${BRAND} Marketplace.`,
    "url": `${DOMAIN}/${city}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": BRAND,
      "url": DOMAIN
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${DOMAIN}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": formattedLocation,
        "item": `${DOMAIN}/${city}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <DiscoveryClient slug={city} parsed={parsed} />
    </>
  );
}
