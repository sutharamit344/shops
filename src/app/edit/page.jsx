"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getShopById, updateShop } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import ImageUpload from "@/components/UI/ImageUpload";
import MenuBuilder from "@/components/Create/MenuBuilder";
import Navbar from "@/components/Navbar";
import { Save, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Zap } from "lucide-react";
import { uploadImage } from "@/lib/storage";
import { getCategories, proposeCategory } from "@/lib/db";
import Link from "next/link";

const EditShopPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [formData, setFormData] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); 
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

  useEffect(() => {
    if (id) {
      const fetchShop = async () => {
        const data = await getShopById(id);
        if (data) {
          // Check ownership
          if (user && data.ownerId !== user.uid) {
            setError("You do not have permission to edit this shop.");
            setLoading(false);
            return;
          }
          setFormData(data);
          setLogoPreview(data.logo || "");
          // Initialize gallery with existing URLs
          setGalleryFiles(data.gallery?.map(url => ({ type: 'existing', url })) || []);
        } else {
          setError("Shop not found.");
        }
        setLoading(false);
      };
      fetchShop();
    }
  }, [id, user]);

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
      const newEntries = files.map(file => ({
        type: 'new',
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
    setSaving(true);
    setError(null);
    setUploadStatus("Updating business profile...");

    try {
      const slug = slugify(formData.name);
      const timestamp = Date.now();

      // 1. Process Logo
      let logoUrl = formData.logo || "";
      if (logoFile) {
        setUploadStatus("Uploading brand logo...");
        const logoPath = `shops/${slug}/logo_edit_${timestamp}.jpg`;
        logoUrl = await uploadImage(logoFile, logoPath);
      }

      // 2. Process Gallery (Keep existing URLs + Upload new files)
      setUploadStatus("Refreshing gallery...");
      const finalGalleryUrls = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const item = galleryFiles[i];
        if (item.type === 'existing') {
          finalGalleryUrls.push(item.url);
        } else {
          const path = `shops/${slug}/gallery/${timestamp}_updated_${i}.jpg`;
          const url = await uploadImage(item.file, path);
          finalGalleryUrls.push(url);
        }
      }

      // 2. Process Menu Items
      setUploadStatus("Updating menu...");
      const finalMenu = await Promise.all((formData.menu || []).map(async (section) => {
        const updatedItems = await Promise.all((section.items || []).map(async (item, i) => {
          if (item.file) {
            const path = `shops/${slug}/menu/${timestamp}_edit_${section.category}_${i}.jpg`;
            const url = await uploadImage(item.file, path);
            return { ...item, image: url, file: null };
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

      // 4. Map Embed Cleaner (Extract src from iframe if needed)
      let cleanMapEmbed = formData.mapEmbed || "";
      if (cleanMapEmbed.includes("<iframe")) {
        const srcMatch = cleanMapEmbed.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          cleanMapEmbed = srcMatch[1];
        }
      }

      // 4. Save to Database
      setUploadStatus("Finalizing changes...");
      const updateData = {
        ...formData,
        mapEmbed: cleanMapEmbed,
        category: finalCategory,
        slug,
        menu: finalMenu,
        gallery: finalGalleryUrls,
        logo: logoUrl,
        status: "pending", // Reset to pending after edit
        proposedCategory: formData.category === "OTHER_PROPOSE"
      };

      const result = await updateShop(id, updateData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading Editor...</div>;

  if (error) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-black text-navy mb-4">{error}</h1>
      <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
    </div>
  );

  if (success) return (
    <main className="max-w-4xl mx-auto px-4 py-32 text-center bg-cream min-h-screen">
      <CheckCircle2 size={80} className="mx-auto text-whatsapp mb-6 animate-bounce" />
      <h1 className="text-4xl font-black text-navy mb-4">Changes Saved!</h1>
      <p className="text-xl text-gray-600 mb-8">Your shop profile is being updated...</p>
    </main>
  );

  return (
    <div className="bg-cream min-h-screen pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-cream/50 rounded-full transition-colors"><ArrowLeft size={24} /></Link>
          <h1 className="text-4xl font-black text-navy uppercase tracking-tighter italic">Edit <span className="text-primary tracking-normal">{formData.name}</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Reuse UI Sections from Create Page */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Basic Information</h2>
            </div>
            <Card className="rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                     <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold" />
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold appearance-none">
                      <option value="">Select Category</option>
                      {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">WhatsApp Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Google Maps Embed Code (Optional)</label>
                  <textarea 
                    name="mapEmbed" 
                    value={formData.mapEmbed} 
                    onChange={handleChange} 
                    rows={4} 
                    className="w-full p-4 rounded-2xl bg-navy/5 border-2 border-primary/10 transition-all focus:border-primary focus:bg-white font-mono text-xs md:text-sm text-navy/70 leading-relaxed"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Branding & Design */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Design & Branding</h2>
            </div>
            <Card className="rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
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

          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Gallery Update</h2>
            </div>
            <Card className="rounded-[40px] p-6 md:p-10 border-cream bg-white shadow-xl shadow-cream/20">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {galleryFiles.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-md group">
                    <img src={item.type === 'existing' ? item.url : item.preview} alt="Gallery" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Loader2 className="rotate-45" size={12} /></button>
                  </div>
                ))}
                <ImageUpload multiple onSelect={handleGallerySelect} />
              </div>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Menu & Services</h2>
            </div>
            <MenuBuilder menuData={formData.menu} onChange={(data) => setFormData({ ...formData, menu: data })} />
          </section>

          <div className="flex flex-col items-center pt-8">
            {saving && (
              <div className="mb-6 flex flex-col items-center gap-2">
                <Loader2 className="text-primary animate-spin" size={40} />
                <p className="text-navy font-black uppercase tracking-widest text-xs">{uploadStatus}</p>
              </div>
            )}
            <Button type="submit" className="w-full md:w-auto min-w-[300px] text-xl md:text-2xl py-6 rounded-[32px] shadow-2xl shadow-primary/30" disabled={saving}>
              {saving ? "Saving Changes..." : "Submit Updates"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditShopPage;
