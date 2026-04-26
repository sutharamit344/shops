"use client";

import React, { useState, useEffect } from "react";
import { slugify } from "@/lib/slugify";
import { uploadImage } from "@/lib/storage";
import { proposeCategory, getCategories, getClusters, proposeCluster } from "@/lib/db";
import ImageUpload from "@/components/UI/ImageUpload";
import Input from "@/components/UI/Input";
import Select from "@/components/UI/Select";
import Textarea from "@/components/UI/Textarea";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

// Icons
import { Save, CheckCircle2, AlertCircle, Plus, Loader2, Zap, MapPin, Phone, Info, X, ChevronRight, ChevronLeft, Image, Star, Palette, ShieldCheck, Clock } from "lucide-react";

const ShopForm = ({ initialData, onSubmit, isEdit = false, isLoading = false, error: externalError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [localError, setLocalError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    city: "",
    state: "",
    area: "",
    zone: "",
    phone: "",
    description: "",
    mapEmbed: "",
    primaryColor: "#FF6B35",
    secondaryColor: "#1A1F36",
    rating: "5.0",
    logo: "",
    businessType: "mixed",
    address: "",
    socialLinks: [],
    logo: "",
    coverImage: "",
    clusterType: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [dbCategories, setDbCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [proposedCategory, setProposedCategory] = useState("");
  const [showCustomCluster, setShowCustomCluster] = useState(false);
  const [dbClusters, setDbClusters] = useState([]);
  const [proposedCluster, setProposedCluster] = useState("");

  const commonClusters = [
    "Food & Dining",
    "Beauty & Wellness",
    "Electronics Market",
    "Fashion Hub",
    "Daily Essentials",
    "Street Food",
    "Automotive",
    "Home & Decor",
    "Health & Medical"
  ];

  const steps = [
    { title: "Basics", desc: "Identity" },
    { title: "Location", desc: "Contact" },
    { title: "Branding", desc: "Look & Feel" }
  ];

  useEffect(() => {
    const init = async () => {
      const [cats, clusters] = await Promise.all([
        getCategories(),
        getClusters()
      ]);
      
      const catNames = cats.map(c => c.name);
      setDbCategories(catNames);
      setDbClusters(clusters);

      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
        setLogoPreview(initialData.logo || "");
        setCoverPreview(initialData.coverImage || "");

        if (initialData.category && !catNames.includes(initialData.category)) {
          setFormData(prev => ({ ...prev, category: "OTHER_PROPOSE" }));
          setProposedCategory(initialData.category);
          setShowNewCategoryInput(true);
        }

        // Check if cluster is in DB or common list
        const allClusterNames = [...commonClusters, ...clusters.map(c => c.name)];
        if (initialData.clusterType && !allClusterNames.includes(initialData.clusterType)) {
          setShowCustomCluster(true);
          setProposedCluster(initialData.clusterType);
        }
      }
    };
    init();
  }, [initialData]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "category") {
      setShowNewCategoryInput(value === "OTHER_PROPOSE");
      
      // Auto-assign clusterType based on category
      const lowVal = value.toLowerCase();
      let cluster = "";
      if (lowVal.includes("food") || lowVal.includes("restaurant") || lowVal.includes("cafe")) cluster = "Food & Dining";
      else if (lowVal.includes("salon") || lowVal.includes("spa") || lowVal.includes("beauty")) cluster = "Beauty & Wellness";
      else if (lowVal.includes("electronic") || lowVal.includes("mobile") || lowVal.includes("computer")) cluster = "Electronics Market";
      else if (lowVal.includes("cloth") || lowVal.includes("fashion") || lowVal.includes("boutique")) cluster = "Fashion Hub";
      else if (lowVal.includes("grocery") || lowVal.includes("kirana") || lowVal.includes("supermarket")) cluster = "Daily Essentials";
      
      if (cluster) {
        setFormData(prev => ({ ...prev, [name]: value, clusterType: cluster }));
        return;
      }
    }
    if (name === "clusterType") {
      setShowCustomCluster(value === "CUSTOM");
    }
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.category)) {
      setLocalError("Shop name and category are required.");
      return;
    }
    if (currentStep === 2 && (!formData.city || !formData.phone)) {
      setLocalError("City and WhatsApp number are required.");
      return;
    }
    setLocalError(null);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setLocalError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const internalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (currentStep < totalSteps) return;

    setLocalError(null);
    setUploadStatus("Processing uploads...");

    try {
      const slug = slugify(formData.name);
      const timestamp = Date.now();

      let logoUrl = formData.logo || "";
      if (logoFile) {
        setUploadStatus("Uploading logo...");
        const path = `shops/${slug}/logo_${timestamp}.jpg`;
        logoUrl = await uploadImage(logoFile, path);
      }

      let coverUrl = formData.coverImage || "";
      if (coverFile) {
        setUploadStatus("Uploading cover image...");
        const path = `shops/${slug}/cover_${timestamp}.jpg`;
        coverUrl = await uploadImage(coverFile, path);
      }

      let finalCategory = formData.category;
      if (formData.category === "OTHER_PROPOSE" && proposedCategory.trim()) {
        finalCategory = proposedCategory.trim();
        await proposeCategory(finalCategory);
      }

      let finalCluster = formData.clusterType;
      if (formData.clusterType === "CUSTOM" && proposedCluster.trim()) {
        finalCluster = proposedCluster.trim();
        await proposeCluster(finalCluster, finalCategory);
      }

      let cleanMapEmbed = formData.mapEmbed || "";
      if (cleanMapEmbed.includes("<iframe")) {
        const srcMatch = cleanMapEmbed.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) cleanMapEmbed = srcMatch[1];
      }

      await onSubmit({
        ...formData,
        mapEmbed: cleanMapEmbed,
        category: finalCategory,
        clusterType: finalCluster,
        logo: logoUrl,
        coverImage: coverUrl,
        slug,
        proposedCategory: formData.category === "OTHER_PROPOSE",
        proposedCluster: formData.clusterType === "CUSTOM"
      });

    } catch (err) {
      console.error(err);
      setLocalError("Failed to process uploads. Please try again.");
    } finally {
      setUploadStatus("");
    }
  };

  const displayError = externalError || localError;

  return (
    <div className="w-full p-4 md:p-8">
      {/* ── PROGRESS STEPS ─────────────────────────────────────── */}
      <div className="max-w-xl mx-auto mb-16 relative">
        <div className="absolute top-5 left-0 w-full h-[2px] bg-[#1A1F36]/[0.06] -z-0">
          <div className="h-full bg-[#FF6B35] transition-all duration-700 ease-in-out" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }} />
        </div>
        <div className="relative flex justify-between z-10">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-[13px] transition-all duration-500 shadow-md
                ${currentStep > i + 1
                  ? "bg-[#FF6B35] text-white"
                  : currentStep === i + 1
                    ? "bg-[#1A1F36] text-white scale-110 shadow-md"
                    : "bg-white text-[#1A1F36]/20 border border-[#1A1F36]/[0.06]"
                }`}>
                {currentStep > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
              </div>
              <div className="absolute top-12 flex flex-col items-center">
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${currentStep === i + 1 ? "text-[#1A1F36]" : "text-[#1A1F36]/30"}`}>
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={internalSubmit} className="space-y-10">
        {/* ── ERROR DISPLAY ─────────────────────────────────────── */}
        {displayError && (
          <div className="bg-red-50 rounded-2xl p-5 flex items-start gap-4 border border-red-100 animate-in shake duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Attention Required</p>
              <p className="text-[14px] text-red-700 font-medium leading-relaxed">{displayError}</p>
            </div>
          </div>
        )}

        {/* ── STEP 1: BASICS ─────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1A1F36] tracking-tight mb-2">Business Identity</h2>
              <p className="text-[15px] text-[#1A1F36]/50 font-medium">Tell us what your business is called and what you specialize in.</p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <ImageUpload
                    onSelect={(file) => { 
                      setLogoFile(file); 
                      setLogoPreview(file ? URL.createObjectURL(file) : ""); 
                    }}
                    currentImage={logoPreview}
                    compact
                    label="Store Logo"
                  />
                </div>
                <div className="flex-1 w-full">
                  <Input
                    label="Business Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sharma Premium Groceries"
                    required
                    helpText="This will define your unique ShopSetu URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Market Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "", label: "Select a category", disabled: true },
                    ...dbCategories.map(c => ({ value: c, label: c })),
                    { value: "OTHER_PROPOSE", label: "➕ Propose new category..." }
                  ]}
                />

                <Select
                  label="Service Model"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "product", label: "Product Based (Retail, Grocery)" },
                    { value: "service", label: "Service Based (Salon, Repair)" },
                    { value: "mixed", label: "Hybrid (Both Products & Services)" }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Cluster / Group Name"
                  name="clusterType"
                  value={showCustomCluster ? "CUSTOM" : formData.clusterType}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select a cluster", disabled: true },
                    ...commonClusters.map(c => ({ value: c, label: c })),
                    ...dbClusters
                      .filter(c => !formData.category || c.category === formData.category)
                      .map(c => ({ value: c.name, label: c.name })),
                    { value: "CUSTOM", label: "➕ Custom Cluster..." }
                  ]}
                  helpText="Groups your business with similar local hubs"
                />
                <div className="flex items-end">
                   <p className="text-[11px] text-[#1A1F36]/40 font-medium mb-3">Helping users find you in "hub" searches like 'Electronics Market'.</p>
                </div>
              </div>

              {showCustomCluster && (
                <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#1A1F36]/[0.04] animate-in zoom-in duration-300">
                  <Input
                    label="Custom Cluster Name"
                    value={proposedCluster}
                    onChange={(e) => setProposedCluster(e.target.value)}
                    placeholder="e.g., Organic Food Park"
                    required
                  />
                </div>
              )}

              <Textarea
                label="Store Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What makes your store unique? Mention your best-sellers or specialties..."
                required
                rows={3}
                helpText="A brief overview of your business for search results."
              />

              {showNewCategoryInput && (
                <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#1A1F36]/[0.04] animate-in zoom-in duration-300">
                  <Input
                    label="New Category Suggestion"
                    value={proposedCategory}
                    onChange={(e) => setProposedCategory(e.target.value)}
                    placeholder="e.g., Organic Lifestyle"
                    required
                  />
                  <p className="text-[11px] text-[#1A1F36]/40 mt-2 font-medium">We will review your suggestion and add it to our global directory.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: LOCATION ───────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1A1F36] tracking-tight mb-2">Reach & Location</h2>
              <p className="text-[15px] text-[#1A1F36]/50 font-medium">Connect your business with local customers in your area.</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="WhatsApp For Business"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  icon={Phone}
                  helpText="Customers will reach out to you on this number"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Primary Locality"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Andheri West"
                />
                <Input
                  label="Landmark / Street"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="e.g., Near Link Road"
                />
              </div>

              <Textarea
                label="Full Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., Shop No. 12, Sai Plaza, MG Road"
                required
                rows={2}
                helpText="Exact location for customers to find you"
              />

            </div>
          </div>
        )}

        {/* ── STEP 3: BRANDING ───────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1A1F36] tracking-tight mb-2">Visual Branding</h2>
              <p className="text-[15px] text-[#1A1F36]/50 font-medium">Personalize your shop page with your brand colors and cover image.</p>
            </div>

            <div className="space-y-6">
               <ImageUpload
                  label="Background Cover Image"
                  onSelect={(file) => {
                    setCoverFile(file);
                    setCoverPreview(file ? URL.createObjectURL(file) : "");
                  }}
                  currentImage={coverPreview}
                  helpText="Recommended size: 1200x400. This will appear as the banner on your shop profile."
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-[#FAFAF8] border-none shadow-none">
                <label className="text-[11px] font-bold text-[#1A1F36]/40 uppercase tracking-[0.15em] mb-4 block">Brand Primary Color</label>
                <div className="flex gap-4 items-center mb-4">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-16 h-16 rounded-[20px] border-4 border-white cursor-pointer shadow-md p-0 overflow-hidden"
                  />
                  <div className="flex-1">
                     <Input
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleChange}
                        className="bg-white"
                      />
                  </div>
                </div>
                <p className="text-[11px] text-[#1A1F36]/40 font-medium leading-relaxed">Used for buttons, category badges, and premium accents throughout your storefront.</p>
              </Card>

              <Card className="p-6 bg-[#FAFAF8] border-none shadow-none">
                <label className="text-[11px] font-bold text-[#1A1F36]/40 uppercase tracking-[0.15em] mb-4 block">Navigation Theme</label>
                <div className="flex gap-4 items-center mb-4">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-16 h-16 rounded-[20px] border-4 border-white cursor-pointer shadow-md p-0 overflow-hidden"
                  />
                  <div className="flex-1">
                     <Input
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleChange}
                        className="bg-white"
                      />
                  </div>
                </div>
                <p className="text-[11px] text-[#1A1F36]/40 font-medium leading-relaxed">Used for sidebar, headings, and high-contrast structural elements.</p>
              </Card>
            </div>

            <div className="p-8 bg-[#1A1F36] rounded-3xl text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120} /></div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em] mb-4">Final Review</h3>
                <p className="text-[16px] font-bold mb-6">By submitting, you agree that your business follows our local marketplace guidelines.</p>
                <div className="flex items-center gap-4 text-[13px] font-bold opacity-60">
                   <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#25D366]" /> <span>Free Forever</span></div>
                   <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#25D366]" /> <span>SEO Optimised</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NAVIGATION ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-[#1A1F36]/[0.06]">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={prevStep}
            icon={ChevronLeft}
            className={`w-full sm:w-auto bg-white ${currentStep === 1 ? "invisible" : ""}`}
          >
            Go Back
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="dark"
                size="lg"
                onClick={nextStep}
                className="w-full sm:w-auto shadow-md"
                icon={ChevronRight}
                iconPosition="right"
              >
                Continue Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="xl"
                disabled={isLoading || uploadStatus}
                loading={isLoading || !!uploadStatus}
                className="w-full sm:w-auto px-12 shadow-md shadow-[#FF6B35]/20"
                icon={Save}
              >
                {uploadStatus || (isEdit ? "Update Business" : "Launch Storefront")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShopForm;