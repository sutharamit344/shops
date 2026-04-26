import React, { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const query = sp.q;
  const city = sp.city;
  const category = sp.category;
  const area = sp.area;

  let titleParts = [];
  
  if (query) {
    titleParts.push(`Search results for "${query}"`);
  } else {
    if (category) {
      titleParts.push(category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    } else {
      titleParts.push("Explore Shops");
    }

    if (city) {
      titleParts.push(`in ${city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    }

    if (area) {
      titleParts.push(`- ${area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    }
  }

  const baseTitle = titleParts.length === 1 && titleParts[0] === "Explore Shops" ? "Marketplace" : titleParts.join(' ');
  const title = `${baseTitle} | ShopSetu`;
  const description = `Discover and connect with verified ${category || 'businesses'} in ${city || 'your area'}. ShopSetu helps you find local services easily.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    }
  };
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[13px] text-[#999] font-medium">Loading Marketplace...</p>
        </div>
      </div>
    }>
      <ExploreClient />
    </Suspense>
  );
}