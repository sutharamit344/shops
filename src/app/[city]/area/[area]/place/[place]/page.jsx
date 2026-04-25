import React from "react";
import { getShopsByZoneInArea, getApprovedShops } from "@/lib/db";
import ListingLayout from "@/components/Shop/ListingLayout";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, area, place } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedArea = decodeURIComponent(area);
  const decodedPlace = decodeURIComponent(place);
  
  return {
    title: `${decodedPlace} in ${decodedArea}, ${decodedCity} | ShopSetu`,
    description: `Browse all businesses and shops located in ${decodedPlace}, ${decodedArea}.`
  };
}

export default async function PlacePage({ params }) {
  const { city, area, place } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedArea = decodeURIComponent(area);
  const decodedPlace = decodeURIComponent(place);
  
  // Note: getShopsByZoneInArea uses 'zone' which corresponds to 'place' in this context
  const shops = await getShopsByZoneInArea(decodedCity, decodedArea, decodedPlace);
  
  return (
    <ListingLayout 
      shops={shops} 
      title={decodedPlace} 
      subtitle={`The best of ${decodedArea}`}
      city={decodedCity}
      type="place"
    />
  );
}
