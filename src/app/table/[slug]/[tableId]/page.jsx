import { getShopBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/config";
import TableOrderClient from "./TableOrderClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: `Not Found | ${BRAND}` };
  return {
    title: `Order at ${shop.name} | ${BRAND}`,
    description: `Browse the menu and place your order at ${shop.name} directly from your phone.`,
  };
}

export default async function TableOrderPage({ params }) {
  const { slug, tableId } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  // Check if QR ordering is enabled (paid feature)
  if (!shop.paidFeatures?.qr_ordering?.enabled) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[14px] font-bold text-[#0A0A0F]/40">QR ordering is not enabled for this shop.</p>
        </div>
      </div>
    );
  }

  return (
    <TableOrderClient
      shop={shop}
      tableId={tableId}
    />
  );
}
