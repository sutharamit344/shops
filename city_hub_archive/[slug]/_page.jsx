import { getShopsByCityAndCategory, getShopsByCityAndArea } from "@/lib/db";
import ShopCard from "@/components/Shop/ShopCard";
import Navbar from "@/components/Navbar";
import { BRAND, DOMAIN } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, slug } = await params;
  const decodedCity = city.replace(/-/g, " ");
  const decodedSlug = slug.replace(/-/g, " ");

  // Heuristic to decide if it's a category or area (can be refined)
  // For SEO, we can assume it's a category first as it's more common
  const title = `${decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)} in ${decodedCity} | ${BRAND}`;
  
  return {
    title,
    description: `Explore shops and services for ${decodedSlug} in ${decodedCity}. Detailed listings and ratings on ${BRAND}.`,
    alternates: {
      canonical: `${DOMAIN}/${city}/${slug}`,
    }
  };
}

export default async function CitySlugPage({ params }) {
  const { city, slug } = await params;
  
  // Try Category first
  let shops = await getShopsByCityAndCategory(city, slug);
  let type = "category";

  // If no category match, try Area
  if (shops.length === 0) {
    const areaShops = await getShopsByCityAndArea(city, slug);
    if (areaShops.length > 0) {
      shops = areaShops;
      type = "area";
    }
  }

  const decodedCity = city.replace(/-/g, " ");
  const decodedSlug = slug.replace(/-/g, " ");

  const heading = type === "category" 
    ? `${decodedSlug} in ${decodedCity}`
    : `Shops in ${decodedSlug}, ${decodedCity}`;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-[#1A1F36] tracking-tight mb-4 capitalize">
            {heading}
          </h1>
          <p className="text-gray-500 font-medium">
            Browse verified listings in this location.
          </p>
        </header>

        {shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.05] p-20 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1F36]">No shops found</h3>
            <p className="text-gray-400 max-w-xs">We couldn't find any results for "{decodedSlug}" in {decodedCity}.</p>
          </div>
        )}
      </main>
    </div>
  );
}
