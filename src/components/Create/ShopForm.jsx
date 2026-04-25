"use client";

import React, { useState, useEffect } from "react";
import { slugify } from "@/lib/slugify";
import { uploadImage } from "@/lib/storage";
import { proposeCategory, getCategories } from "@/lib/db";
import ImageUpload from "@/components/UI/ImageUpload";
import Input from "@/components/UI/Input";
import Select from "@/components/UI/Select";
import Textarea from "@/components/UI/Textarea";
// UI Components

// Icons
import { Save, CheckCircle2, AlertCircle, Plus, Loader2, Zap, MapPin, Phone, Info, X, ChevronRight, ChevronLeft, Image, Star, Palette } from "lucide-react";

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
    secondaryColor: "#0F0F0F",
    rating: "5.0",
    logo: "",
    businessType: "mixed",
    socialLinks: [],
    openingHoursDetails: {
      monday: { open: "09:00", close: "21:00", isClosed: false },
      tuesday: { open: "09:00", close: "21:00", isClosed: false },
      wednesday: { open: "09:00", close: "21:00", isClosed: false },
      thursday: { open: "09:00", close: "21:00", isClosed: false },
      friday: { open: "09:00", close: "21:00", isClosed: false },
      saturday: { open: "09:00", close: "21:00", isClosed: false },
      sunday: { open: "09:00", close: "21:00", isClosed: true },
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [dbCategories, setDbCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [proposedCategory, setProposedCategory] = useState("");

  const steps = [
    { title: "Basics", desc: "Name & Category" },
    { title: "Location", desc: "Contact & Address" },
    { title: "Theme", desc: "Branding & Photos" }
  ];

  useEffect(() => {
    const init = async () => {
      const cats = await getCategories();
      const catNames = cats.map(c => c.name);
      setDbCategories(catNames);

      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
        setLogoPreview(initialData.logo || "");

        if (initialData.category && !catNames.includes(initialData.category)) {
          setFormData(prev => ({ ...prev, category: "OTHER_PROPOSE" }));
          setProposedCategory(initialData.category);
          setShowNewCategoryInput(true);
        }
      }
    };
    init();
  }, [initialData]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "category") setShowNewCategoryInput(value === "OTHER_PROPOSE");
    setFormData({ ...formData, [name]: value });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHoursDetails: {
        ...prev.openingHoursDetails,
        [day]: {
          ...(prev.openingHoursDetails?.[day] || { open: "09:00", close: "21:00", isClosed: false }),
          [field]: value
        }
      }
    }));
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



      const finalMenu = [];

      let finalCategory = formData.category;
      if (formData.category === "OTHER_PROPOSE" && proposedCategory.trim()) {
        finalCategory = proposedCategory.trim();
        await proposeCategory(finalCategory);
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
        menu: finalMenu,
        logo: logoUrl,
        slug,
        proposedCategory: formData.category === "OTHER_PROPOSE"
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
    <div className="w-full">
      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto mb-12 px-2">
        <div className="relative flex justify-between">
          <div className="absolute top-4 left-0 w-full h-[1px] bg-black/[0.06] -z-10">
            <div className={`h-full bg-[#FF6B35] transition-all duration-500`} style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}></div>
          </div>
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-[11px] transition-all duration-300 ${currentStep > i + 1
                ? "bg-[#FF6B35] text-white"
                : currentStep === i + 1
                  ? "bg-[#0F0F0F] text-white scale-105 shadow-sm"
                  : "bg-white text-[#ccc] border border-black/[0.06]"
                }`}>
                {currentStep > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <div className="absolute -bottom-8 flex flex-col items-center w-24">
                <span className={`text-[9px] font-semibold text-center transition-colors ${currentStep === i + 1 ? "text-[#0F0F0F]" : "text-[#999]"
                  }`}>
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={internalSubmit} className="space-y-8">
        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3 border border-red-100">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Error</p>
              <p className="text-[12px] text-red-700">{displayError}</p>
            </div>
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-[#0F0F0F] tracking-tight mb-1">Shop Basics</h2>
              <p className="text-[12px] text-[#666]">Tell us about your business</p>
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <ImageUpload
                    onSelect={(file) => { 
                      setLogoFile(file); 
                      setLogoPreview(file ? URL.createObjectURL(file) : ""); 
                    }}
                    currentImage={logoPreview}
                    compact
                    label="Logo"
                  />
                </div>
                <div className="flex-1 w-full">
                  <Input
                    label="Shop Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sharma Kirana Store"
                    required
                    helpText="This will be your shop's unique URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "", label: "Select category", disabled: true },
                    ...dbCategories.map(c => ({ value: c, label: c })),
                    { value: "OTHER_PROPOSE", label: "➕ Propose new category" }
                  ]}
                />

                <Select
                  label="Business Type"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "product", label: "Products" },
                    { value: "service", label: "Services" },
                    { value: "mixed", label: "Both products & services" }
                  ]}
                />
              </div>

              {showNewCategoryInput && (
                <div className="animate-in zoom-in duration-200">
                  <Input
                    label="Proposed Category Name"
                    value={proposedCategory}
                    onChange={(e) => setProposedCategory(e.target.value)}
                    placeholder="e.g., Organic Store"
                    required
                  />
                  <p className="text-[10px] text-[#999] mt-1">We'll review and add it to our category list</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & CONTACT */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-[#0F0F0F] tracking-tight mb-1">Location & Contact</h2>
              <p className="text-[12px] text-[#666]">Help customers find and reach you</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="WhatsApp Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  icon={Phone}
                />
                <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Locality/Area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Andheri West"
                />
                <Input
                  label="Place/Street"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="Main Market"
                />
              </div>

              <Textarea
                label="Shop Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your shop, what makes you special, and what you offer..."
                required
                rows={3}
              />

              <div>
                <label className="block text-[11px] font-semibold text-[#0F0F0F] mb-1">Google Maps Embed</label>
                <Textarea
                  name="mapEmbed"
                  value={formData.mapEmbed}
                  onChange={handleChange}
                  placeholder="Paste Google Maps iframe embed code or URL"
                  rows={2}
                />
                <p className="text-[10px] text-[#999] mt-1">Paste the iframe code from Google Maps sharing option</p>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Loader2 className="animate-spin-slow" size={14} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#0F0F0F]">Business Hours</h3>
                </div>

                <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-black/[0.04]">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-black/[0.04] last:border-0">
                      <span className="text-[12px] font-bold text-[#0F0F0F] capitalize w-24">{day}</span>
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="time"
                          disabled={formData.openingHoursDetails?.[day]?.isClosed}
                          value={formData.openingHoursDetails?.[day]?.open || "09:00"}
                          onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                          className="flex-1 h-9 px-3 bg-white border border-black/[0.08] rounded-xl text-[12px] font-medium text-[#0F0F0F] outline-none focus:border-[#FF6B35]/50 disabled:opacity-30"
                        />
                        <span className="text-[10px] text-[#999] font-bold">to</span>
                        <input
                          type="time"
                          disabled={formData.openingHoursDetails?.[day]?.isClosed}
                          value={formData.openingHoursDetails?.[day]?.close || "21:00"}
                          onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                          className="flex-1 h-9 px-3 bg-white border border-black/[0.08] rounded-xl text-[12px] font-medium text-[#0F0F0F] outline-none focus:border-[#FF6B35]/50 disabled:opacity-30"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.openingHoursDetails?.[day]?.isClosed}
                          onChange={(e) => handleHoursChange(day, "isClosed", e.target.checked)}
                          className="w-4 h-4 rounded border-black/[0.08] text-[#FF6B35] focus:ring-[#FF6B35]/20"
                        />
                        <span className="text-[10px] font-bold text-[#999] group-hover:text-red-500 transition-colors uppercase tracking-wider">Closed</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BRANDING */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-[#0F0F0F] tracking-tight mb-1">Brand Identity</h2>
              <p className="text-[12px] text-[#666]">Customize your shop's look and feel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-[#0F0F0F]">Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-xl border border-black/[0.06] cursor-pointer"
                  />
                  <Input
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-[10px] text-[#999]">Used for buttons, links, and accents</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-[#0F0F0F]">Secondary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-xl border border-black/[0.06] cursor-pointer"
                  />
                  <Input
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-[10px] text-[#999]">Used for backgrounds and highlights</p>
              </div>
            </div>

            <div className="pt-4 pb-4">
              <Select
                label="Rating Display"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                options={[
                  { value: "5.0", label: "5.0 Stars - Trust Badge" },
                  { value: "4.5", label: "4.5 Stars - Verified" },
                  { value: "4.0", label: "4.0 Stars - Good" }
                ]}
              />
              <p className="text-[10px] text-[#999] mt-1">Shown as a trust badge on your shop page</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-black/[0.06]">
          <button
            key="prev-btn"
            type="button"
            onClick={prevStep}
            className={`w-full sm:w-auto px-6 py-2.5 border border-black/[0.06] text-[#0F0F0F] text-[12px] font-semibold rounded-xl hover:bg-gray-50 transition-all ${currentStep === 1 ? "invisible" : ""
              }`}
          >
            <ChevronLeft size={14} className="inline mr-1" /> Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              key="next-btn"
              type="button"
              onClick={nextStep}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-all"
            >
              Continue <ChevronRight size={14} className="inline ml-1" />
            </button>
          ) : (
            <button
              key="submit-btn"
              type="submit"
              disabled={isLoading || uploadStatus}
              className="w-full sm:w-auto px-8 py-3 bg-[#FF6B35] text-white text-[13px] font-semibold rounded-xl hover:bg-[#e85c25] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || uploadStatus) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {uploadStatus || "Saving..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? "Update Shop" : "Create Shop"}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ShopForm;