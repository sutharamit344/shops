import TablesClient from "./TablesClient";
import { getShopBySlug } from "@/lib/db";
import { BRAND } from "@/lib/config";

export const metadata = {
  title: `Tables & QR Manager | ${BRAND}`,
  description: "Manage your restaurant tables and generate QR codes for table ordering.",
};

export default function TablesPage() {
  return <TablesClient />;
}
