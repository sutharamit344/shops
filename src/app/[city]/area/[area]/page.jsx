import React from "react";
import { getShopsByCityAndArea, getApprovedShops } from "@/lib/db";
import ListingLayout from "@/components/Shop/ListingLayout";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, area } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedArea = decodeURIComponent(area);
  
  return {
    title: `Best Shops in ${decodedArea}, ${decodedCity} | ShopSetu`,
    description: `Discover local favorites and businesses in the ${decodedArea} area of ${decodedCity}.`
  };
}

export default async function AreaPage({ params }) {
  const { city, area } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedArea = decodeURIComponent(area);
  
  const shops = await getShopsByCityAndArea(decodedCity, decodedArea);
  
  return (
    <ListingLayout 
      shops={shops} 
      title={`Explore ${decodedArea}`} 
      subtitle={`Local favorites in ${decodedCity}`}
      city={decodedCity}
      type="area"
    />
  );
}
