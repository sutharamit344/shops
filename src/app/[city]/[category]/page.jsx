import React from "react";
import { getShopsByCityAndCategory, getApprovedShops, getCategories } from "@/lib/db";
import ListingLayout from "@/components/Shop/ListingLayout";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, category } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedCategory = decodeURIComponent(category);

  return {
    title: `Best ${decodedCategory} in ${decodedCity} | ShopSetu`,
    description: `Explore top-rated ${decodedCategory} businesses and shops in ${decodedCity}.`
  };
}

export default async function CityCategoryPage({ params }) {
  const { city, category } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedCategory = decodeURIComponent(category);

  const shops = await getShopsByCityAndCategory(decodedCity, decodedCategory);

  return (
    <ListingLayout
      shops={shops}
      title={`Best ${decodedCategory}`}
      subtitle={`Top-rated businesses in ${decodedCity}`}
      city={decodedCity}
      type="category"
    />
  );
}
