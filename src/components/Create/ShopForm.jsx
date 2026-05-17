"use client";

import React, { useState, useEffect } from "react";
import { slugify } from "@/lib/slugify";
import { uploadImage } from "@/lib/storage";
import { proposeCategory, getCategories, getClusters, proposeCluster, getCountries, getStates, getCities, getAreas } from "@/lib/db";
import ImageUpload from "@/components/UI/ImageUpload";
import Input from "@/components/UI/Input";
import Select from "@/components/UI/Select";
import HybridSelect from "@/components/UI/HybridSelect";
import Textarea from "@/components/UI/Textarea";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import("@/components/UI/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-medium">Loading Map...</div>
});

// Icons
import {
  Save, CircleCheckBig, CircleAlert, Plus, Loader2, Navigation,
  ChevronRight, ChevronLeft, ShieldCheck, Sparkles, Eye, LinkIcon,
  MapIcon,
  Search,
  Building2,
  Mail,
  Globe
} from "lucide-react";

const ShopForm = ({ initialData, onSubmit, isEdit = false, isLoading = false, error: externalError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [localError, setLocalError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const totalSteps = 2;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    city: "",
    state: "",
    country: "India",
    area: "",
    zone: "",
    phone: "",
    ownerEmail: "",
    description: "",
    mapEmbed: "",
    primaryColor: "#FF6A00",
    secondaryColor: "#0A0A0F",
    rating: "5.0",
    logo: "",
    businessType: "mixed",
    shopNo: "",
    building: "",
    village: "",
    socialLinks: [],
    coverImage: "",
    clusterType: "",
    pincode: "",
    lat: null,
    lng: null
  });

  const STORAGE_KEY = "shop_form_draft";

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [dbCategories, setDbCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [proposedCategory, setProposedCategory] = useState("");
  const [showCustomCluster, setShowCustomCluster] = useState(false);
  const [dbClusters, setDbClusters] = useState([]);
  const [dbCountries, setDbCountries] = useState([]);
  const [dbStates, setDbStates] = useState([]);
  const [dbCities, setDbCities] = useState([]);
  const [dbAreas, setDbAreas] = useState([]);

  const [proposedCluster, setProposedCluster] = useState("");
  const [draftLoadedAtMount, setDraftLoadedAtMount] = useState(false);
  const [showMoreAddress, setShowMoreAddress] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  const steps = [
    { title: "Basics", desc: "Identity" },
    { title: "Location", desc: "Contact" }
  ];

  // Load draft on mount
  useEffect(() => {
    if (!isEdit) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...draft }));
          setDraftLoadedAtMount(true);
          if (draft.category === "OTHER_PROPOSE") setShowNewCategoryInput(true);
          if (draft.clusterType === "CUSTOM") setShowCustomCluster(true);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEdit]);

  // Save draft on change
  useEffect(() => {
    if (!isEdit && formData.name) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isEdit]);

  useEffect(() => {
    const init = async () => {
      const [cats, clusters, countries, states, cities, areas] = await Promise.all([
        getCategories(),
        getClusters(),
        getCountries(),
        getStates(),
        getCities(),
        getAreas()
      ]);

      const catNames = cats.map(c => c.name);
      setDbCategories(catNames);
      setDbClusters(clusters);
      setDbCountries(countries);
      setDbStates(states);
      setDbCities(cities);
      setDbAreas(areas);

      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
        setLogoPreview(initialData.logo || "");
        setCoverPreview(initialData.coverImage || "");

        if (initialData.category && !catNames.includes(initialData.category)) {
          setFormData(prev => ({ ...prev, category: "OTHER_PROPOSE" }));
          setProposedCategory(initialData.category);
          setShowNewCategoryInput(true);
        }

        const allClusterNames = clusters.map(c => c.name);
        if (initialData.clusterType && !allClusterNames.includes(initialData.clusterType)) {
          setShowCustomCluster(true);
          setProposedCluster(initialData.clusterType);
        }
      }
    };
    init();
  }, [initialData]);

  // Hierarchical Options
  const countryOptions = dbCountries.map(c => ({ value: c.name, label: c.name }));

  const selectedCountryId = dbCountries.find(c => c.name === formData.country)?.id;
  const filteredStates = dbStates.filter(s => !selectedCountryId || s.countryId === selectedCountryId);
  const stateOptions = filteredStates.map(s => ({ value: s.name, label: s.name }));

  const selectedStateId = dbStates.find(s => s.name === formData.state)?.id;
  const filteredCities = dbCities.filter(c => !selectedStateId || c.stateId === selectedStateId);
  const cityOptions = filteredCities.map(c => ({ value: c.name, label: c.name }));

  const selectedCityId = dbCities.find(c => c.name === formData.city)?.id;
  const filteredAreas = dbAreas.filter(a => !selectedCityId || a.cityId === selectedCityId);
  const areaOptions = filteredAreas.map(a => ({ value: a.name, label: a.name }));

  const handleCountryChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      country: value,
      state: "",
      city: "",
      area: ""
    }));
  };

  const handleStateChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      state: value,
      city: "",
      area: ""
    }));
  };

  const handleCityChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      city: value,
      area: ""
    }));
  };

  const getCountryCode = (countryName) => {
    const codes = {
      "India": "+91",
      "United Arab Emirates": "+971",
      "Saudi Arabia": "+966",
      "USA": "+1"
    };
    return codes[countryName] || "+91";
  };

  const handleAreaChange = (e) => {
    const { value } = e.target;
    const selectedArea = dbAreas.find(a => a.name === value);

    if (selectedArea) {
      const parentCity = dbCities.find(c => c.id === selectedArea.cityId);
      const parentState = parentCity ? dbStates.find(s => s.id === parentCity.stateId) : null;
      const parentCountry = parentState ? dbCountries.find(c => c.id === parentState.countryId) : null;

      setFormData(prev => ({
        ...prev,
        area: value,
        city: parentCity ? parentCity.name : prev.city,
        state: parentState ? parentState.name : prev.state,
        country: parentCountry ? parentCountry.name : prev.country,
        pincode: selectedArea.pincode || prev.pincode,
        // If the area has coordinates, update them too
        lat: selectedArea.lat ? parseFloat(selectedArea.lat) : prev.lat,
        lng: selectedArea.lng ? parseFloat(selectedArea.lng) : prev.lng
      }));
    } else {
      setFormData(prev => ({ ...prev, area: value }));
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-format phone number
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(-10);
    }

    if (name === "category") {
      setShowNewCategoryInput(value === "OTHER_PROPOSE");
    }
    if (name === "clusterType") {
      setShowCustomCluster(value === "CUSTOM");
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocationSelect = async (coords) => {
    setFormData(prev => ({
      ...prev,
      lat: coords.lat,
      lng: coords.lng
    }));

    // Reverse Geocoding
    try {
      setIsGeocoding(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`);
      const data = await res.json();

      if (data && data.address) {
        const { road, suburb, neighbourhood, city, town, village, state, country, postcode } = data.address;

        const geocodedArea = suburb || neighbourhood || road;
        const geocodedCity = city || town || village;
        const geocodedState = state;
        const geocodedCountry = country;

        // Try to find exact matches in our master data to ensure the dropdowns sync correctly
        let matchedCountry = dbCountries.find(c => c.name.toLowerCase() === geocodedCountry?.toLowerCase())?.name || geocodedCountry;
        let matchedState = dbStates.find(s => s.name.toLowerCase() === geocodedState?.toLowerCase())?.name || geocodedState;
        let matchedCity = dbCities.find(c => c.name.toLowerCase() === geocodedCity?.toLowerCase())?.name || geocodedCity;
        let matchedArea = geocodedArea;

        // FIND NEAREST AREA BASED ON COORDINATES
        let minDistance = Infinity;

        dbAreas.forEach(area => {
          if (area.lat && area.lng) {
            const dist = calculateDistance(coords.lat, coords.lng, parseFloat(area.lat), parseFloat(area.lng));
            if (dist < minDistance && dist < 5000) { // Within 5km radius
              minDistance = dist;
              matchedArea = area.name;

              // AUTO-SYNC PARENTS: If we find a nearest area in our DB, use its parent chain
              const parentCity = dbCities.find(c => c.id === area.cityId);
              if (parentCity) {
                matchedCity = parentCity.name;
                const parentState = dbStates.find(s => s.id === parentCity.stateId);
                if (parentState) {
                  matchedState = parentState.name;
                  const parentCountry = dbCountries.find(c => c.id === parentState.countryId);
                  if (parentCountry) {
                    matchedCountry = parentCountry.name;
                  }
                }
              }
            }
          }
        });

        // Fallback to name matching for parents if no coordinate match found
        if (minDistance === Infinity) {
          const areaByName = dbAreas.find(a => a.name.toLowerCase() === geocodedArea?.toLowerCase());
          if (areaByName) {
            matchedArea = areaByName.name;
            const parentCity = dbCities.find(c => c.id === areaByName.cityId);
            if (parentCity) {
              matchedCity = parentCity.name;
              const parentState = dbStates.find(s => s.id === parentCity.stateId);
              if (parentState) matchedState = parentState.name;
            }
          }
        }

        // FIND NEAREST CLUSTER
        let minClusterDist = Infinity;
        let matchedCluster = "";

        dbClusters.forEach(cluster => {
          if (cluster.lat && cluster.lng) {
            const dist = calculateDistance(coords.lat, coords.lng, parseFloat(cluster.lat), parseFloat(cluster.lng));
            if (dist < minClusterDist && dist < 3000) { // Within 3km radius
              minClusterDist = dist;
              matchedCluster = cluster.name;
            }
          }
        });

        if (matchedCluster) setShowCustomCluster(false);

        setFormData(prev => ({
          ...prev,
          area: matchedArea || prev.area,
          city: matchedCity || prev.city,
          state: matchedState || prev.state,
          country: matchedCountry || prev.country,
          clusterType: matchedCluster || prev.clusterType,
          pincode: postcode || prev.pincode,
          village: village || "",
          lat: coords.lat,
          lng: coords.lng
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapSearch = async (e) => {
    if (e) e.preventDefault();
    if (!mapSearchQuery.trim()) return;

    try {
      setIsGeocoding(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(mapSearchQuery)}&limit=1`);
      const data = await res.json();

      if (data && data[0]) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        handleLocationSelect(coords);
      }
    } catch (err) {
      console.error("Map search failed", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.category) {
        setLocalError("Shop name and category are required.");
        return;
      }
      if (formData.category === "OTHER_PROPOSE" && !proposedCategory.trim()) {
        setLocalError("Please enter your proposed market category.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.city || !formData.phone || !formData.ownerEmail) {
        setLocalError("City, WhatsApp number, and Owner Email are required.");
        return;
      }

      // WhatsApp Validation (10 digits)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ""))) {
        setLocalError("Please enter a valid 10-digit WhatsApp number.");
        return;
      }

      // Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.ownerEmail)) {
        setLocalError("Please enter a valid email address.");
        return;
      }
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

    // If user hits 'Enter' on Step 1, move to Step 2 instead of submitting
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    // On the final step, we only want to submit if the user explicitly clicked the button,
    // not if they just hit 'Enter' in an input field (which can be accidental).
    // We check if the event is a 'submit' and has a submitter.
    if (e && e.type === 'submit' && !e.nativeEvent.submitter) {
      return;
    }

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
        await proposeCluster(finalCluster, finalCategory, formData.area, formData.city);
      }

      let cleanMapEmbed = formData.mapEmbed || "";
      if (cleanMapEmbed.includes("<iframe")) {
        const srcMatch = cleanMapEmbed.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) cleanMapEmbed = srcMatch[1];
      }

      // AUTO-GEOCODING (Free Nominatim) - Skip if already detected via GPS
      let lat = formData.lat;
      let lng = formData.lng;

      if (!lat || !lng) {
        try {
          setUploadStatus("Geocoding address...");
          const addressStr = `${formData.shopNo || ""}, ${formData.building || ""}, ${formData.zone || ""}, ${formData.village || ""}, ${formData.area || ""}, ${formData.city}, ${formData.state}, India`;
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
        }
      }

      await onSubmit({
        ...formData,
        mapEmbed: cleanMapEmbed,
        category: finalCategory,
        clusterType: finalCluster,
        logo: logoUrl,
        coverImage: coverUrl,
        lat,
        lng,
        slug,
        proposedCategory: formData.category === "OTHER_PROPOSE",
        proposedCluster: formData.clusterType === "CUSTOM"
      });

      if (!isEdit) {
        localStorage.removeItem(STORAGE_KEY);
      }

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
      {/* ── DRAFT NOTICE ─────────────────────────────────────── */}
      {draftLoadedAtMount && currentStep === 1 && (
        <div className="max-w-xl mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles size={16} />
            </div>
            <p className="text-[13px] font-medium text-amber-900">We found a saved draft. You can continue or start over.</p>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-[11px] font-bold text-amber-700 uppercase tracking-wider hover:text-amber-900 transition-colors"
          >
            Clear Draft
          </button>
        </div>
      )}
      {/* ── PROGRESS STEPS ─────────────────────────────────────── */}
      <div className="max-w-xl mx-auto mb-12 relative px-4">
        <div className="absolute top-[18px] left-0 w-full h-[1px] bg-black/[0.05] -z-0">
          <div className="h-full bg-[#FF6A00] transition-all duration-700 ease-in-out" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }} />
        </div>
        <div className="relative flex justify-between z-10">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] transition-all duration-500
                ${currentStep > i + 1
                  ? "bg-[#FF6A00] text-white"
                  : currentStep === i + 1
                    ? "bg-[#0A0A0F] text-white shadow-xl scale-110"
                    : "bg-white text-[#0A0A0F]/20 border border-black/[0.05]"
                }`}>
                {currentStep > i + 1 ? <CircleCheckBig size={16} /> : i + 1}
              </div>
              <div className="absolute top-10 flex flex-col items-center whitespace-nowrap">
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${currentStep === i + 1 ? "text-[#0A0A0F]" : "text-[#0A0A0F]/20"}`}>
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
        {/* ── ERROR DISPLAY ─────────────────────────────────────── */}
        {displayError && (
          <div className="bg-red-50 rounded-2xl p-5 flex items-start gap-4 border border-red-100 animate-in shake duration-300">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <CircleAlert size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Attention Required</p>
              <p className="text-[14px] text-red-700 font-medium leading-relaxed">{displayError}</p>
            </div>
          </div>
        )}

        {/* ── STEP 1: BASICS ─────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
            <div>
              <h2 className="text-[20px] font-bold text-[#0A0A0F] tracking-tight mb-1">Business Identity</h2>
              <p className="text-[13px] text-[#0A0A0F]/45 font-medium">Define your store name, category, and core specialties.</p>
            </div>

            <div className="space-y-8">
              <div className="w-full flex flex-col md:flex-row gap-6">
                <ImageUpload
                  onSelect={(file) => {
                    setLogoFile(file);
                    setLogoPreview(file ? URL.createObjectURL(file) : "");
                  }}
                  currentImage={logoPreview}

                  className="aspect-[4/3]"
                  label="Store Logo"
                />
                <div className="flex-1">
                  <ImageUpload
                    label="Background Cover Image"
                    onSelect={(file) => {
                      setCoverFile(file);
                      setCoverPreview(file ? URL.createObjectURL(file) : "");
                    }}
                    className="w-full h-36"
                    currentImage={coverPreview}
                    helpText="Recommended size: 1200x400. This will appear as the banner on your shop profile."
                  /></div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">

                <div className="flex-1 w-full">
                  <Input
                    label="Business Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sharma Premium Groceries"
                    required
                    helpText="This will define your unique ShopBajar URL"
                  />
                </div>
              </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HybridSelect
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
                  showInput={showNewCategoryInput}
                  onToggleInput={setShowNewCategoryInput}
                  inputName="proposedCategory"
                  inputValue={proposedCategory}
                  onInputChange={(e) => setProposedCategory(e.target.value)}
                  inputPlaceholder="e.g., Organic Lifestyle"
                  inputHelpText="We will review and add this to our directory"
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



            </div>
          </div>
        )}

        {/* ── STEP 2: LOCATION ───────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {/* 📍 SECTION: LOCATION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                  <MapIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A0A0F]">Shop Location</h2>
                  <p className="text-[13px] text-[#0A0A0F]/50">Pin your shop accurately for customers to find you.</p>
                </div>
              </div>

              <div className="bg-[#F7F7F5] rounded-lg border border-black/[0.05] overflow-hidden relative">
                {/* Map Search Overlay */}
                <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
                  <div className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0F]/30 group-focus-within:text-[#FF6A00] transition-colors">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for area, building or street..."
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMapSearch(e)}
                      className="w-full h-9 pl-9 pr-4 bg-white/90 backdrop-blur-md border border-black/[0.05] rounded-lg text-[12px] font-medium shadow-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    className="h-9 px-4 bg-[#0A0A0F] text-white rounded-lg font-bold text-[11px] shadow-xl hover:bg-[#FF6A00] transition-all active:scale-95 flex items-center gap-2"
                  >
                    Find
                  </button>
                </div>

                <MapComponent
                  height="340px"
                  center={{
                    lat: formData.lat || 23.0225,
                    lng: formData.lng || 72.5714
                  }}
                  onLocationSelect={handleLocationSelect}
                />

                <div className="absolute bottom-6 left-6 right-6 z-[400] flex justify-between items-end pointer-events-none">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!navigator.geolocation) return alert("Geolocation not supported");
                      setIsGeocoding(true);
                      navigator.geolocation.getCurrentPosition((pos) => {
                        handleLocationSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      }, () => setIsGeocoding(false));
                    }}
                    className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-white text-[#0A0A0F] rounded-2xl text-[13px] font-bold shadow-xl hover:text-[#FF6A00] transition-all active:scale-95 border border-white"
                  >
                    <Navigation size={16} className="text-[#FF6A00]" />
                    Use Current Location
                  </button>

                  {isGeocoding && (
                    <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 border border-white">
                      <Loader2 size={16} className="animate-spin text-[#FF6A00]" />
                      <span className="text-[12px] font-bold text-[#0A0A0F]">Smart Locating...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🏢 SECTION: ADDRESS DETAILS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A0A0F]">Address Details</h2>
                  <p className="text-[13px] text-[#0A0A0F]/50">Verify and complete your business address.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Shop Number (Optional)"
                  name="shopNo"
                  value={formData.shopNo}
                  onChange={handleChange}
                  placeholder="e.g. Shop G-12"
                />
                <Input
                  label="Building / Complex (Optional)"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g. Skyline Corporate Park"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                  options={[
                    { value: "", label: "Select Country" },
                    ...countryOptions
                  ]}
                />
                <Select
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleStateChange}
                  required
                  options={[
                    { value: "", label: "Select State" },
                    ...stateOptions
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  required
                  options={[
                    { value: "", label: "Select City" },
                    ...cityOptions
                  ]}
                />
                <Select
                  label="Area / Locality"
                  name="area"
                  value={formData.area}
                  onChange={handleAreaChange}
                  required
                  options={[
                    { value: "", label: "Select Area" },
                    ...areaOptions
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 380060"
                  required
                />
                <Input
                  label="Village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Chenpur"
                />
              </div>

              {/* Expandable Section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreAddress(!showMoreAddress)}
                  className="flex items-center gap-2 text-[13px] font-bold text-[#FF6A00] hover:underline"
                >
                  <Plus size={16} className={`transition-transform duration-300 ${showMoreAddress ? 'rotate-45' : ''}`} />
                  {showMoreAddress ? 'Hide additional details' : 'Add more address details'}
                </button>

                {showMoreAddress && (
                  <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Landmark"
                        name="zone"
                        value={formData.zone}
                        onChange={handleChange}
                        placeholder="e.g. Opp. Reliance Fresh"
                      />
                      <HybridSelect
                        label="Market / Business Area (Optional)"
                        name="clusterType"
                        value={formData.clusterType}
                        onChange={handleChange}
                        options={[
                          { value: "", label: "Select Business Area" },
                          ...dbClusters.map(c => ({ value: c.name, label: c.name })),
                          { value: "CUSTOM", label: "Other / Propose New Market Area" }
                        ]}
                        helpText="Groups your business with similar local hubs."
                        showInput={showCustomCluster}
                        onToggleInput={setShowCustomCluster}
                        inputName="proposedCluster"
                        inputValue={proposedCluster}
                        onInputChange={(e) => setProposedCluster(e.target.value)}
                        inputPlaceholder="e.g. Navrangpura Commercial Hub"
                        inputHelpText="Our team will review and add this market to the discovery engine."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="pt-6 border-t border-black/[0.04] grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="WhatsApp For Business"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  prefix={getCountryCode(formData.country)}
                  helpText="Customers will reach out to you on this number"
                />
                <Input
                  label="Owner Email Address"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="owner@example.com"
                  required
                  icon={Mail}
                  helpText="Used for business verification and updates"
                />
              </div>
            </div>

            {/* 🌐 SECTION: DISCOVERY & SEO */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A0A0F]">Discovery & SEO</h2>
                  <p className="text-[13px] text-[#0A0A0F]/50">How your shop appears to customers online.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-[#0A0A0F]/[0.06] rounded-[24px] space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#0A0A0F]/40 uppercase tracking-wider">
                    <LinkIcon size={12} />
                    Live SEO URL Preview
                  </div>
                  <div className="text-[14px] font-medium text-[#0A0A0F] break-all">
                    shopbajar.com/
                    <span className="text-[#FF6A00]">{slugify(formData.city || "city")}/</span>
                    <span className="text-[#FF6A00]">{slugify(formData.area || "area")}/</span>
                    <span className="text-[#FF6A00] font-bold">{slugify(formData.name || "shop-name")}</span>
                  </div>
                </div>

                <div className="p-6 bg-[#0A0A0F] rounded-[24px] space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    <Eye size={12} />
                    Marketplace Discovery
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] text-white/60">Your shop will appear under:</p>
                    <p className="text-[16px] font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-[#FF6A00]" />
                      {formData.category || "Select Category"}s in {formData.area || "Select Area"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreement Card */}
            <div className="p-8 bg-gradient-to-br from-[#0A0A0F] to-[#2D3450] rounded-[32px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120} /></div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-[0.2em] mb-4">Final Registration</h3>
                <p className="text-[18px] font-bold mb-6 leading-tight">Your digital storefront is almost ready for launch.</p>
                <div className="flex flex-wrap items-center gap-6 text-[13px] font-bold opacity-70">
                  <div className="flex items-center gap-2"><CircleCheckBig size={16} className="text-[#25D366]" /> <span>Free Listing</span></div>
                  <div className="flex items-center gap-2"><CircleCheckBig size={16} className="text-[#25D366]" /> <span>Live Maps</span></div>
                  <div className="flex items-center gap-2"><CircleCheckBig size={16} className="text-[#25D366]" /> <span>Direct WhatsApp</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NAVIGATION ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-[#0A0A0F]/[0.06]">
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
                type="button"
                onClick={() => internalSubmit()}
                variant="primary"
                size="xl"
                disabled={isLoading || uploadStatus}
                loading={isLoading || !!uploadStatus}
                className="w-full sm:w-auto px-12 shadow-md shadow-[#FF6A00]/20"
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

