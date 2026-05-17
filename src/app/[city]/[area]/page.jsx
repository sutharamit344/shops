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

  const locationName = parsed.location || city.replace(/-/g, " ");
  const formattedLocation = locationName.charAt(0).toUpperCase() + locationName.slice(1);
  const labelName = parsed.category || area.replace(/-/g, " ");
  const formattedLabel = labelName.charAt(0).toUpperCase() + labelName.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${formattedLabel} in ${formattedLocation}`,
    "description": `Find top-rated ${formattedLabel} in ${formattedLocation}. Verified contact details and locations on ${BRAND}.`,
    "url": `${DOMAIN}/${city}/${area}`,
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": formattedLabel,
        "item": `${DOMAIN}/${city}/${area}`
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
      <DiscoveryClient slug={`${city}/${area}`} parsed={parsed} />
    </>
  );
}
