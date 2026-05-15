import { NextResponse } from "next/server";
import { getClusters } from "@/lib/db";

export async function GET() {
  try {
    const clusters = await getClusters();
    return NextResponse.json(clusters);
  } catch (error) {
    console.error("API Error [Clusters]:", error);
    return NextResponse.json(
      { error: "Failed to fetch clusters" },
      { status: 500 },
    );
  }
}
