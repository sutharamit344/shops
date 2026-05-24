import { getShopsByCityAreaAndCategory } from "@/lib/db";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import ShopCard from "@/components/Shop/ShopCard";
import Navbar from "@/components/Navbar";
import { BRAND, DOMAIN } from "@/lib/config";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city, area, category } = await params;
  const decodedCity = city.replace(/-/g, " ");
  const decodedArea = area.replace(/-/g, " ");
  const decodedCategory = category.replace(/-/g, " ");

  const title = `${decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)}s in ${decodedArea}, ${decodedCity} | ${BRAND}`;
  const description = `Find the best ${decodedCategory} in ${decodedArea}, ${decodedCity} with ratings and details. Verified shops on ${BRAND}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/${city}/${area}/${category}`,
    }
  };
}

export default async function AreaCategoryPage({ params }) {
  const { city, area, category } = await params;
  const shops = await getShopsByCityAreaAndCategory(city, area, category);

  const decodedCity = city.replace(/-/g, " ");
  const decodedArea = area.replace(/-/g, " ");
  const decodedCategory = category.replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-[#1A1F36] tracking-tight mb-4 capitalize">
            {decodedCategory}s in {decodedArea}, {decodedCity}
          </h1>
          <p className="text-gray-500 font-medium">
            Discover {shops.length} verified {decodedCategory}s in this location.
          </p>
        </header>

        {shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-md border border-black/[0.05] p-20 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-md bg-gray-50 flex items-center justify-center text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1F36]">No shops found</h3>
            <p className="text-gray-400 max-w-xs">We couldn't find any {decodedCategory} in {decodedArea} right now.</p>
          </div>
        )}
      </main>
    </div>
  );
}
