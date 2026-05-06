import DiscoveryClient from "@/components/Search/DiscoveryClient";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import { notFound } from "next/navigation";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city } = await params;
  const parsed = parseDiscoveryPath({ slug: city });
  
  if (!parsed) return null;

  const { category, location } = parsed;
  const title = location ? `Discover ${location}` : (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Marketplace");
  const fullTitle = `${title} | ${BRAND} Marketplace`;

  return {
    title: fullTitle,
    description: `Explore verified shops and services in ${location || "your area"}. Smart discovery on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${city}`,
    },
    openGraph: {
      title: fullTitle,
      url: `${DOMAIN}/${city}`,
      siteName: BRAND,
    }
  };
}

export default async function CityHubPage({ params }) {
  const { city } = await params;
  const parsed = parseDiscoveryPath({ slug: city });

  if (!parsed) return notFound();

  const { category, location } = parsed;
  const title = location ? `Discover ${location}` : (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Marketplace");
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
        "name": location || category,
        "item": `${DOMAIN}/${city}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DiscoveryClient slug={city} parsed={parsed} />
    </>
  );
}
