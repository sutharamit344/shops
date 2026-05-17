import React from "react";
import { getShopBySlug, getCategories } from "@/lib/db";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import { slugify } from "@/lib/slugify";

import { BRAND, DOMAIN } from "@/lib/config";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) return { title: `Shop Not Found | ${BRAND}` };

  const title = `${shop.name} - ${shop.category} in ${shop.city} | ${BRAND}`;
  const description = shop.description || `View ${shop.name}, a verified ${shop.category} in ${shop.city}. Contact details, location, and reviews on ${BRAND}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/shop/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/shop/${slug}`,
      siteName: BRAND,
      images: [shop.logo || "/og-image.png"],
    },
  };
}

export default async function ShopPage({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const masterCategories = await getCategories();

  // Extract catalog items for OfferCatalog
  const allItems = [];
  if (shop.menu && Array.isArray(shop.menu)) {
    shop.menu.forEach(sec => {
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach(item => {
          if (item.name) {
            allItems.push({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": item.name,
                "description": item.description || `${item.name} offered by ${shop.name}`,
                "image": item.image || shop.logo || `${DOMAIN}/sb-logo.png`
              },
              "price": item.price ? Number(item.price) : "0",
              "priceCurrency": "INR"
            });
          }
        });
      }
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": shop.name,
    "description": shop.description || `${shop.name} is a verified ${shop.category} in ${shop.city}.`,
    "image": shop.logo || `${DOMAIN}/sb-logo.png`,
    "category": shop.category,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": shop.address || shop.area || "",
      "addressLocality": shop.area || "",
      "addressRegion": shop.city || "",
      "postalCode": shop.pincode || "",
      "addressCountry": shop.country || "IN"
    },
    "geo": shop.lat && shop.lng ? {
      "@type": "GeoCoordinates",
      "latitude": shop.lat,
      "longitude": shop.lng
    } : undefined,
    "url": `${DOMAIN}/shop/${slug}`,
    "telephone": shop.phone || "",
    "aggregateRating": shop.totalRatings > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": shop.avgRating || 5,
      "reviewCount": shop.totalRatings || 1
    } : undefined,
    "hasOfferCatalog": allItems.length > 0 ? {
      "@type": "OfferCatalog",
      "name": "Products and Services",
      "itemListElement": allItems
    } : undefined,
    "openingHoursSpecification": shop.openingHoursDetails ? Object.entries(shop.openingHoursDetails).map(([day, details]) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
      "opens": details.open || "09:00",
      "closes": details.close || "21:00"
    })) : [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "21:00"
      }
    ]
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
      <ShopProfileClient shop={shop} masterCategories={masterCategories} />
    </div>
  );
}
