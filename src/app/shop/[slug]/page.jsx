import React from "react";
import { getShopBySlug } from "@/lib/db";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": shop.name,
    "description": shop.description || `${shop.name} is a verified ${shop.category} in ${shop.city}.`,
    "image": shop.logo || `${DOMAIN}/sb-logo.png`,
    "category": shop.category,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": shop.address || "",
      "addressLocality": shop.area || "",
      "addressRegion": shop.city || "",
      "postalCode": shop.pincode || "",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": shop.lat || null,
      "longitude": shop.lng || null
    },
    "url": `${DOMAIN}/shop/${slug}`,
    "telephone": shop.phone || "",
    "aggregateRating": shop.totalRatings > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": shop.avgRating || 0,
      "reviewCount": shop.totalRatings || 0
    } : null
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopProfileClient shop={shop} />
    </div>
  );
}
