import React from "react";
import { getShopsByCategory, getCategories } from "@/lib/db";
import CategoryListingClient from "@/components/Shop/CategoryListingClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    const common = [
      "Kirana Store", "Salon", "Restaurant", "Medical Store", 
      "Mobile Repair", "Coaching", "Bakery", "Hardware",
      "kirana-store", "salon", "restaurant", "medical-store", 
      "mobile-repair", "coaching", "bakery", "hardware"
    ];
    
    const dbCats = categories.filter(c => c && c.name).map(c => c.name.toString().trim());
    const allNames = [...new Set([...common, ...dbCats])].filter(Boolean);

    return allNames.map(name => ({
      name: name
    }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  // Try exact match, then capitalized/formatted
  let shops = await getShopsByCategory(decodedName);
  
  if (shops.length === 0) {
    // Try "medical-store" -> "Medical Store"
    const formatted = decodedName
      .split(/[- ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    const altShops = await getShopsByCategory(formatted);
    if (altShops.length > 0) shops = altShops;
  }
  
  return (
    <CategoryListingClient 
      shops={shops} 
      title={decodedName} 
      subtitle={`Top businesses in ${decodedName}`}
      view="category"
    />
  );
}
