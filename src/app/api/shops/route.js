import { NextResponse } from "next/server";
import { getApprovedShops } from "@/lib/db";

export async function GET() {
  try {
    const shops = await getApprovedShops();
    return NextResponse.json(shops);
  } catch (error) {
    console.error("API Error [Shops]:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
