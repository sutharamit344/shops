import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const [citiesSnap, areasSnap] = await Promise.all([
      getDocs(query(collection(db, "cities"), orderBy("name", "asc"))),
      getDocs(query(collection(db, "areas"), orderBy("name", "asc")))
    ]);

    const cities = citiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const areas = areasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ cities, areas });
  } catch (error) {
    console.error("API Error [Locations]:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
