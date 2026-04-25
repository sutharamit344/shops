import { redirect } from "next/navigation";

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  // Redirect to explore page with category filter and nearby detection enabled
  redirect(`/explore?category=${encodeURIComponent(decodedName)}&nearby=true`);
}
