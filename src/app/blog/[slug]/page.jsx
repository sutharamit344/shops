import React from "react";
import BlogSingleClient from "./BlogSingleClient";
import { BRAND, DOMAIN } from "@/lib/config";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/db";

// Serialize Firestore Timestamps so they can be safely passed to Client Components
function serializeBlog(blog) {
  if (!blog) return null;
  return {
    ...blog,
    createdAt: blog.createdAt?.seconds
      ? blog.createdAt.seconds * 1000
      : blog.createdAt ?? null,
    updatedAt: blog.updatedAt?.seconds
      ? blog.updatedAt.seconds * 1000
      : blog.updatedAt ?? null,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) return { title: `Article Not Found | ${BRAND}` };

  const title = `${blog.title} | ${BRAND} Journal`;
  const description = blog.excerpt || `Read ${blog.title} on the ShopBajar Journal. Explore insights, tips, and stories from the heart of local commerce.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/blog/${slug}`,
      siteName: `${BRAND} Journal`,
      images: [blog.coverImage || "/sb-logo.png"],
      type: "article",
      authors: [blog.author || "ShopBajar Editorial"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.coverImage || "/sb-logo.png"],
    }
  };
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const rawBlog = await getBlogBySlug(slug);

  if (!rawBlog) {
    notFound();
  }

  // Serialize Timestamps before passing to Client Component
  const blog = serializeBlog(rawBlog);

  // Schema.org Structured Data for Article (use serialized timestamps)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.coverImage || `${DOMAIN}/sb-logo.png`,
    "datePublished": blog.createdAt ? new Date(blog.createdAt).toISOString() : null,
    "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : (blog.createdAt ? new Date(blog.createdAt).toISOString() : null),
    "author": {
      "@type": "Person",
      "name": blog.author || "ShopBajar Editorial"
    },
    "publisher": {
      "@type": "Organization",
      "name": BRAND,
      "logo": {
        "@type": "ImageObject",
        "url": `${DOMAIN}/sb-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${DOMAIN}/blog/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogSingleClient blog={blog} />
    </>
  );
}
