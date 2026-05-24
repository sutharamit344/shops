import KitchenClient from "./KitchenClient";
import { BRAND } from "@/lib/config";

export const metadata = {
  title: `Kitchen — Live Orders | ${BRAND}`,
  description: "Real-time order management dashboard for kitchen staff.",
};

export default function KitchenPage() {
  return <KitchenClient />;
}
