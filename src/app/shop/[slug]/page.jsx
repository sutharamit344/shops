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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <ShopProfileClient shop={shop} />
    </div>
  );
}
