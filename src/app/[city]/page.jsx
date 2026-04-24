import React from "react";
import { getShopsByCity, getApprovedShops } from "@/lib/db";
import ListingLayout from "@/components/Shop/ListingLayout";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const shops = await getApprovedShops();
    const cities = [...new Set(shops.map(s => s.city).filter(Boolean))];
    return cities.map(city => ({
      city: city?.toString() || ""
    }));
  } catch (error) {
    console.error("Error generating static params for cities:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  return {
    title: `Best Shops in ${decodedCity} | ShopSetu`,
    description: `Discover the best local shops and businesses in ${decodedCity}.`
  };
}

export default async function CityPage({ params }) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);

  const shops = await getShopsByCity(decodedCity);

  return (
    <ListingLayout
      shops={shops}
      title={`Discover ${decodedCity}`}
      subtitle="The heart of local commerce, curated for you."
      city={decodedCity}
      type="city"
    />
  );
}
