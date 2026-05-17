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

  const locationName = parsed.location || `${area.replace(/-/g, " ")}, ${city.replace(/-/g, " ")}`;
  const formattedLocation = locationName.charAt(0).toUpperCase() + locationName.slice(1);
  const catLabel = parsed.category || category.replace(/-/g, " ");
  const formattedCat = catLabel.charAt(0).toUpperCase() + catLabel.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${formattedCat} in ${formattedLocation}`,
    "description": `Discover best ${formattedCat} in ${formattedLocation}, ${city}. Ratings, locations, and contact info on ${BRAND}.`,
    "url": `${DOMAIN}/${city}/${area}/${category}`,
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
        "name": city.replace(/-/g, " ").charAt(0).toUpperCase() + city.replace(/-/g, " ").slice(1),
        "item": `${DOMAIN}/${city}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": area.replace(/-/g, " ").charAt(0).toUpperCase() + area.replace(/-/g, " ").slice(1),
        "item": `${DOMAIN}/${city}/${area}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": formattedCat,
        "item": `${DOMAIN}/${city}/${area}/${category}`
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
      <DiscoveryClient slug={`${city}/${area}/${category}`} parsed={parsed} />
    </>
  );
}
