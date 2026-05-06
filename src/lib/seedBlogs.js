import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { slugify } from "./slugify";

const SAMPLE_BLOGS = [
  {
    title: "5 Ways to Boost Your Local Shop's Visibility in 2026",
    category: "Growth",
    author: "ShopBajar Team",
    readTime: "6 min read",
    excerpt: "Discover how digital-first strategies can help your physical store attract more neighborhood customers than ever before.",
    coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80",
    content: `
      <h2>The New Era of Local Commerce</h2>
      <p>The year 2026 has brought a massive shift in how people shop. While global giants continue to dominate the digital space, there is a powerful resurgence in local commerce. Customers are looking for quality, trust, and immediate gratification.</p>
      
      <h3>1. Claim Your Digital Identity</h3>
      <p>Your shop needs to exist beyond its physical walls. Listing on platform like <strong>ShopBajar</strong> ensures that when someone searches for a product near them, your store is the first thing they see.</p>
      
      <h3>2. Leverage WhatsApp as a Sales Tool</h3>
      <p>WhatsApp has become the operating system of Bharat. Don't just use it for chats; use it to send product updates, take orders, and build long-term relationships with your customers.</p>
      
      <h3>3. Focus on Hyper-Local SEO</h3>
      <p>Ensure your area name (like Gota, Ahmedabad) is mentioned clearly in your business description. This helps search engines connect you with local users.</p>
      
      <img src="https://images.unsplash.com/photo-1534452285072-c5cee545d30a?auto=format&fit=crop&q=80" alt="Local Shop" />
      
      <h3>4. Visual Storytelling</h3>
      <p>A picture is worth a thousand sales. Regularly update your shop gallery with high-quality photos of your new stock and your store's ambiance.</p>
      
      <h3>5. Community Engagement</h3>
      <p>Run special offers for your neighborhood. A "Local Resident Discount" can build incredible loyalty that big e-commerce sites can never match.</p>
    `
  },
  {
    title: "The Power of WhatsApp Marketing for Small Businesses",
    category: "Marketing",
    author: "Amit Suthar",
    readTime: "5 min read",
    excerpt: "Learn why WhatsApp is the most effective tool for driving sales and building customer trust in the Indian market.",
    coverImage: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80",
    content: `
      <h2>Why WhatsApp?</h2>
      <p>In India, WhatsApp isn't just an app; it's a way of life. For a small business owner, it's the most direct channel to reach a customer's pocket.</p>
      
      <h3>Instant Connection</h3>
      <p>Unlike email which might go unread for days, WhatsApp messages have a 98% open rate. When you list your business on ShopBajar, we prioritize the "Chat on WhatsApp" button because we know that's where conversions happen.</p>
      
      <h3>Personalization at Scale</h3>
      <p>You can send personalized messages to your regular customers, making them feel valued. A simple "Hi Ramesh, the new cotton shirts you liked are in stock" can lead to an immediate sale.</p>
      
      <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80" alt="Customer Support" />
      
      <h3>Trust and Transparency</h3>
      <p>Being able to chat with a real person builds trust. Customers can ask questions about sizing, pricing, or availability and get answers in real-time.</p>
    `
  },
  {
    title: "Why Every Local Shop Needs a Premium Digital Identity",
    category: "Business",
    author: "Webiest Solutions",
    readTime: "4 min read",
    excerpt: "Generic listings are a thing of the past. Discover why your digital presence should look as professional as a multi-national brand.",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80",
    content: `
      <h2>Your Website is Your Virtual Storefront</h2>
      <p>Just as you sweep your shop floor and arrange your window display, your digital presence needs care and premium design. A cluttered or outdated listing sends the wrong message to potential customers.</p>
      
      <h3>Premium Design = Premium Trust</h3>
      <p>When a customer finds your shop on a clean, fast, and modern platform like ShopBajar, they automatically associate that quality with your business. It elevates your brand from a 'local store' to a 'modern professional establishment'.</p>
      
      <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80" alt="Store Front" />
      
      <h3>SEO and Google Search</h3>
      <p>A professional digital identity isn't just about looks. It's about being technically sound so that Google can crawl your data and show your products to people searching nearby.</p>
    `
  },
  {
    title: "Understanding the Shift: Why Customers are Returning to Local Markets",
    category: "Insights",
    author: "ShopBajar Team",
    readTime: "7 min read",
    excerpt: "E-commerce fatigue is real. We explore why people are craving the physical shopping experience and how you can capitalize on it.",
    coverImage: "https://images.unsplash.com/photo-1488459739036-7c383679116e?auto=format&fit=crop&q=80",
    content: `
      <h2>The Return to the Neighborhood</h2>
      <p>After years of ordering everything online, customers are realizing what they've lost: the touch-and-feel of products, the immediate availability, and the social interaction of the local bazaar.</p>
      
      <h3>The End of the 'Wait'</h3>
      <p>Even 'Quick Commerce' takes 10-20 minutes. Walking to the corner store is often faster and allows for better product selection. Local shops that provide a quick 'Check Stock Online' feature are winning this race.</p>
      
      <h3>Eco-Conscious Shopping</h3>
      <p>Modern customers are increasingly worried about the packaging waste and carbon footprint of frequent home deliveries. Shopping local is the more sustainable choice, and people are starting to care.</p>
      
      <img src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80" alt="Local Market" />
      
      <h3>The Personal Touch</h3>
      <p>An algorithm can't recommend a gift for your mother like a shopkeeper who has known your family for a decade. The future of retail is personal, and local shops are the kings of personalization.</p>
    `
  }
];

export async function seedBlogs(onProgress) {
  const total = SAMPLE_BLOGS.length;
  let current = 0;

  for (const blog of SAMPLE_BLOGS) {
    try {
      await addDoc(collection(db, "blogs"), {
        ...blog,
        slug: slugify(blog.title),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      current++;
      if (onProgress) onProgress(current, total);
    } catch (error) {
      console.error("Error seeding blog:", error);
    }
  }
  return true;
}
