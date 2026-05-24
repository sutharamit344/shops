import WaiterClient from "./WaiterClient";
import { BRAND } from "@/lib/config";

export const metadata = {
  title: `Waiter Console | ${BRAND}`,
  description: "Real-time table session, approvals, and dining management for waiting staff.",
};

export default function WaiterPage() {
  return <WaiterClient />;
}
