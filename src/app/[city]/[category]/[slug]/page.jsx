import React from "react";
import { getShopBySlug, getShopRatings, getApprovedShops } from "@/lib/db";
import { notFound } from "next/navigation";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const shops = await getApprovedShops();
    return shops
      .filter(s => s.city && s.category && s.slug && s.category.toLowerCase() !== "area")
      .map(s => ({
        city: s.city?.toString() || "",
        category: s.category?.toString() || "",
        slug: s.slug?.toString() || ""
      }));
  } catch (error) {
    console.error("Error generating static params for shop profiles:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const shop = await getShopBySlug(decodedSlug, true);

  if (!shop) return { title: "Not Found | ShopSetu" };

  return {
    title: `${shop.name} - ${shop.category} in ${shop.city} | ShopSetu`,
    description: shop.description
  };
}

export default async function ShopProfilePage({ params }) {
  const { city, category, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const shop = await getShopBySlug(decodedSlug, true);

  if (!shop) {
    notFound();
  }

  const initialRatings = await getShopRatings(shop.id);

  return <ShopProfileClient shop={shop} initialRatings={initialRatings} />;
}
