import React from "react";
import { getShopsByCityAndCategory, getApprovedShops, getCategories } from "@/lib/db";
import ListingLayout from "@/components/Shop/ListingLayout";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const [shops, categories] = await Promise.all([
      getApprovedShops(),
      getCategories()
    ]);

    const cities = [...new Set(shops.map(s => s.city).filter(Boolean))];
    const categoryNames = categories
      .map(c => c.name)
      .filter(name => name && name.toLowerCase() !== "area");

    const params = [];
    cities.forEach(city => {
      categoryNames.forEach(cat => {
        params.push({ city: city?.toString() || "", category: cat?.toString() || "" });
      });
    });

    return params;
  } catch (error) {
    console.error("Error generating static params for city categories:", error);
    return [];
  }
}

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
