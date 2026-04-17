"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/slugify";
import { saveShop } from "@/lib/db";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import ImageUpload from "@/components/UI/ImageUpload";
import MenuBuilder from "@/components/Create/MenuBuilder";
import { Save, CheckCircle2, AlertCircle, ImageIcon, Plus, Loader2, Zap } from "lucide-react";
import { uploadImage } from "@/lib/storage";
import { getCategories, proposeCategory } from "@/lib/db";
import { useEffect } from "react";

const CreateShopPage = () => {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]); // Mix of { type: 'existing', url } and { type: 'new', file, preview }

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    city: "",
    state: "",
    area: "",
    phone: "",
    description: "",
    mapEmbed: "",
    primaryColor: "#E94E1B",
    secondaryColor: "#0F172A",
    fontFamily: "Outfit",
    rating: "5",
    logo: "",
    menu: [{ category: "Our Products", items: [{ name: "", price: "", description: "", image: "", file: null }] }],
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [dbCategories, setDbCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [proposedCategory, setProposedCategory] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await getCategories();
      setDbCategories(cats.map(c => c.name));
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Map Embed cleaning moved to handleSubmit for better UX

    if (name === "category") {
      setShowNewCategoryInput(value === "OTHER_PROPOSE");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleGallerySelect = (files) => {
    if (files && files.length > 0) {
      const newEntries = files?.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setGalleryFiles(prev => [...prev, ...newEntries]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadStatus("Starting production...");

    if (!formData.name || !formData.phone || !formData.city) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const slug = slugify(formData.name);
      const timestamp = Date.now();

      // 1. Upload Logo if present
      let logoUrl = "";
      if (logoFile) {
        setUploadStatus("Uploading logo...");
        const logoPath = `shops/${slug}/logo_${timestamp}.jpg`;
        logoUrl = await uploadImage(logoFile, logoPath);
      }

      // 2. Upload Gallery Images
      setUploadStatus("Uploading gallery...");
      const galleryUrls = [];
      for (let i = 0; i < (galleryFiles || []).length; i++) {
        const { file } = galleryFiles[i];
        const path = `shops/${slug}/gallery/${timestamp}_${i}.jpg`;
        const url = await uploadImage(file, path);
        galleryUrls.push(url);
      }

      // 2. Upload Menu Item Images
      setUploadStatus("Processing menu photos...");
      const finalMenu = await Promise.all((formData.menu || []).map(async (section) => {
        const updatedItems = await Promise.all((section.items || []).map(async (item, i) => {
          if (item.file) {
            const path = `shops/${slug}/menu/${timestamp}_${section.category}_${i}.jpg`;
            const url = await uploadImage(item.file, path);
            return { ...item, image: url, file: null }; // Remove file object before saving to Firestore
          }
          return { ...item, file: null };
        }));
        return { ...section, items: updatedItems };
      }));

      // 3. Handle Category Proposal if needed
      let finalCategory = formData.category;
      if (formData.category === "OTHER_PROPOSE" && proposedCategory.trim()) {
        finalCategory = proposedCategory.trim();
        await proposeCategory(finalCategory);
      }

      // 4. Save to Database
      setUploadStatus("Finalizing shop page...");
      // 4. Map Embed Cleaner (Extract src from iframe if needed)
      let cleanMapEmbed = formData.mapEmbed || "";
      if (cleanMapEmbed.includes("<iframe")) {
        const srcMatch = cleanMapEmbed.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          cleanMapEmbed = srcMatch[1];
        }
      }

      // 5. Save to Database
      setUploadStatus("Opening your shop doors...");
      const shopData = {
        ...formData,
        mapEmbed: cleanMapEmbed,
        category: finalCategory,
        menu: finalMenu,
        gallery: galleryUrls,
        logo: logoUrl,
        slug,
        status: "pending",
        ownerId: user.uid,
        ownerEmail: user.email,
        proposedCategory: formData.category === "OTHER_PROPOSE"
      };

      const result = await saveShop(shopData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        throw new Error("Database save failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate shop page. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  if (success) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-32 text-center">
        <CheckCircle2 size={80} className="mx-auto text-whatsapp mb-6 animate-bounce" />
        <h1 className="text-4xl font-black text-navy mb-4">Shop Submitted!</h1>
        <p className="text-xl text-gray-600 mb-8">Redirecting to homepage...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-black text-navy mb-4">Sign In Required</h1>
        <p className="text-xl text-gray-600 mb-8">You need to be signed in to create a shop.</p>
        <Button onClick={loginWithGoogle}>Sign In with Google</Button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-navy mb-3 uppercase tracking-tighter italic">Launch Your <span className="text-primary tracking-normal">Page</span></h1>
        <p className="text-sm md:text-base text-gray-500 font-medium px-4">Create a high-resolution presence for your business.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
        {error && (
          <div className="bg-red-50 text-red-600 p-5 md:p-6 rounded-3xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} className="flex-shrink-0" /> <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-2xl font-black text-navy uppercase tracking-tight">Basic Information</h2>
          </div>
          <Card className="rounded-3xl md:rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-cream">
                <div className="space-y-2 text-center md:text-left">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Shop Logo</label>
                   <ImageUpload 
                     onSelect={(file) => {
                       setLogoFile(file);
                       setLogoPreview(URL.createObjectURL(file));
                     }} 
                     currentImage={logoPreview}
                   />
                </div>
                <div className="flex-1 space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Shop Name</label>
                   <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Royal Sweets" className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
                   <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-tighter">Your brand ID on the platform</p>
                </div>
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                  <select required name="category" value={formData.category} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold appearance-none text-sm md:text-base">
                    <option value="">Select Category</option>
                    {dbCategories?.map(c => <option key={c} value={c}>{c}</option>)}
                    <option disabled>──────────</option>
                    <option value="OTHER_PROPOSE" className="text-primary font-black">✨ Other / Propose New</option>
                  </select>
                </div>

                {showNewCategoryInput && (
                  <div className="space-y-1.5 animate-in slide-in-from-left duration-500">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Propose Category Name</label>
                    <div className="relative">
                      <input
                        required
                        value={proposedCategory}
                        onChange={(e) => setProposedCategory(e.target.value)}
                        placeholder="e.g. Handmade Crafts"
                        className="w-full p-4 pl-12 rounded-2xl bg-primary/5 border-2 border-primary/20 focus:ring-2 focus:ring-primary font-bold text-sm md:text-base"
                      />
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-tighter italic">Your proposal will be verified by our admin team.</p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City</label>
                <input required name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">State</label>
                <input required name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">WhatsApp Number</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Locality</label>
                <input name="area" value={formData.area} onChange={handleChange} placeholder="Andheri West" className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Tell customers about your shop..." rows={3} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Google Maps Embed Code (Optional)</label>
                <textarea
                  name="mapEmbed"
                  value={formData.mapEmbed}
                  onChange={handleChange}
                  placeholder="Paste <iframe ...> code here"
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-navy/5 border-2 border-primary/10 transition-all focus:border-primary focus:bg-white font-mono text-xs md:text-sm text-navy/70 leading-relaxed"
                />
                <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-tighter">Copy the HTML from Google Maps &gt; Share &gt; Embed a Map</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Branding & Design */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-2xl font-black text-navy uppercase tracking-tight">Design & Branding</h2>
          </div>
          <Card className="rounded-3xl md:rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Color</label>
                <div className="flex gap-3 items-center">
                   <input type="color" name="primaryColor" value={formData.primaryColor || "#E94E1B"} onChange={handleChange} className="w-16 h-14 p-1 rounded-xl bg-cream/20 border-none cursor-pointer" />
                   <input name="primaryColor" value={formData.primaryColor || "#E94E1B"} onChange={handleChange} className="flex-1 p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm uppercase" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Secondary Color</label>
                <div className="flex gap-3 items-center">
                   <input type="color" name="secondaryColor" value={formData.secondaryColor || "#0F172A"} onChange={handleChange} className="w-16 h-14 p-1 rounded-xl bg-cream/20 border-none cursor-pointer" />
                   <input name="secondaryColor" value={formData.secondaryColor || "#0F172A"} onChange={handleChange} className="flex-1 p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm uppercase" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Shop Name Typography</label>
                <select name="fontFamily" value={formData.fontFamily || "Outfit"} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base appearance-none">
                   <option value="Outfit">Modern (Outfit)</option>
                   <option value="Playfair Display">Elegant (Playfair Display)</option>
                   <option value="Montserrat">Modern Sans (Montserrat)</option>
                   <option value="Lora">Classic Serif (Lora)</option>
                   <option value="Bebas Neue">Bold Headline (Bebas Neue)</option>
                   <option value="Space Grotesque">Unique Tech (Space Grotesque)</option>
                   <option value="Inter">Professional (Inter)</option>
                   <option value="Roboto Mono">Technical (Roboto Mono)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Display Rating</label>
                <select name="rating" value={formData.rating || "5"} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold text-sm md:text-base appearance-none">
                   {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
            </div>
          </Card>
        </section>

        {/* Gallery */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-2xl font-black text-navy uppercase tracking-tight">Shop Gallery</h2>
          </div>
          <Card className="rounded-3xl md:rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {galleryFiles?.map((item, i) => (
                <div key={i} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-md group">
                  <img src={item.preview} alt="Gallery" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Plus className="rotate-45" size={12} /></button>
                </div>
              ))}
              <ImageUpload multiple onSelect={handleGallerySelect} />
            </div>
            <p className="mt-4 text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest text-center md:text-left">Select multiple photos at once</p>
          </Card>
        </section>

        {/* Nested Menu */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-2xl font-black text-navy uppercase tracking-tight">Menu / Services</h2>
          </div>
          <MenuBuilder menuData={formData.menu} onChange={(data) => setFormData({ ...formData, menu: data })} />
        </section>

        <div className="flex flex-col items-center pt-8">
          {loading && (
            <div className="mb-6 flex flex-col items-center gap-2">
              <Loader2 className="text-primary animate-spin" size={40} />
              <p className="text-navy font-black uppercase tracking-widest text-xs animate-pulse">{uploadStatus}</p>
            </div>
          )}
          <Button type="submit" className="w-full md:w-auto min-w-[300px] text-xl md:text-2xl py-5 md:py-6 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-primary/30" disabled={loading}>
            {loading ? "Processing..." : (
              <div className="flex items-center gap-2">
                <Save size={24} /> Go Live Now
              </div>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
};

export default CreateShopPage;
