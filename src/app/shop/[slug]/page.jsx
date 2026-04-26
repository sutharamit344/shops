import React from "react";
import { getShopBySlug } from "@/lib/db";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) return { title: "Shop Not Found | ShopSetu" };

  return {
    title: `${shop.name} | ${shop.category} in ${shop.city} | ShopSetu`,
    description: shop.description || `View ${shop.name}, a verified ${shop.category} in ${shop.city}. Contact details, location, and reviews on ShopSetu.`,
    openGraph: {
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
