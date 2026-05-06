import DiscoveryClient from "@/components/Search/DiscoveryClient";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import { notFound } from "next/navigation";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, category } = await params;
  const parsed = parseDiscoveryPath({ city, category });
  
  if (!parsed) return null;

  const { category: catName, location } = parsed;
  const title = `Best ${catName} in ${location}`;
  const fullTitle = `${title} | ${BRAND} Marketplace`;

  return {
    title: fullTitle,
    description: `Discover top ${catName} in ${location}. Smart discovery for local shops on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${city}/${category}`,
    },
    openGraph: {
      title: fullTitle,
      url: `${DOMAIN}/${city}/${category}`,
      siteName: BRAND,
    }
  };
}

export default async function DiscoveryCategoryPage({ params }) {
  const { city, category } = await params;
  const parsed = parseDiscoveryPath({ city, category });

  if (!parsed) return notFound();

  const { category: catName, location } = parsed;
  const title = `Best ${catName} in ${location}`;
  const fullTitle = `${title} | ${BRAND} Marketplace`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": DOMAIN
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": location,
        "item": `${DOMAIN}/${city}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": catName,
        "item": `${DOMAIN}/${city}/${category}`
      }
    ]
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": fullTitle,
    "description": `Browse verified ${catName} in ${location}. Find top-rated shops, contact details, and locations.`,
    "url": `${DOMAIN}/${city}/${category}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <DiscoveryClient slug={`${city}/${category}`} parsed={parsed} />
    </>
  );
}
