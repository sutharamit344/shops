import React from "react";
import { getShopBySlug, getCategories } from "@/lib/db";
import FullCatalogClient from "@/components/Shop/FullCatalogClient";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { BRAND, DOMAIN } from "@/lib/config";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) return { title: `Catalog Not Found | ${BRAND}` };

  const title = `Full Catalog & Inventory - ${shop.name} | ${BRAND}`;
  const description = `Explore the complete product and service catalog of ${shop.name} in ${shop.city}. View pricing, details, and enquire directly on ${BRAND}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/shop/${slug}/catalog`,
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/shop/${slug}/catalog`,
      siteName: BRAND,
      images: [shop.logo || "/og-image.png"],
    },
  };
}

export default async function CatalogPage({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const masterCategories = await getCategories();

  const allItems = [];
  if (shop.menu && Array.isArray(shop.menu)) {
    shop.menu.forEach(sec => {
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach(item => {
          if (item.name) {
            allItems.push({
              "@type": "ListItem",
              "position": allItems.length + 1,
              "item": {
                "@type": "Product",
                "name": item.name,
                "description": item.description || `${item.name} from ${shop.name}`,
                "image": item.image || shop.logo || `${DOMAIN}/sb-logo.png`,
                "offers": {
                  "@type": "Offer",
                  "price": item.price ? Number(item.price) : "0",
                  "priceCurrency": "INR"
                }
              }
            });
          }
        });
      }
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Full Catalog & Inventory - ${shop.name}`,
    "description": `Explore the complete product and service catalog of ${shop.name} in ${shop.city}.`,
    "url": `${DOMAIN}/shop/${slug}/catalog`,
    "isPartOf": {
      "@type": "WebSite",
      "name": BRAND,
      "url": DOMAIN
    },
    "mainEntity": allItems.length > 0 ? {
      "@type": "ItemList",
      "name": `Catalog Items of ${shop.name}`,
      "itemListElement": allItems
    } : undefined
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
        "name": shop.city || "City",
        "item": `${DOMAIN}/${slugify(shop.city || "city")}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": shop.area || "Area",
        "item": `${DOMAIN}/${slugify(shop.city || "city")}/${slugify(shop.area || "area")}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": shop.name,
        "item": `${DOMAIN}/shop/${slug}`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Catalog",
        "item": `${DOMAIN}/shop/${slug}/catalog`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <FullCatalogClient shop={shop} masterCategories={masterCategories} />
    </div>
  );
}
