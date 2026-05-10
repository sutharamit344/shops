"use client";

import React from "react";
import { 
  ShoppingBag, 
  Utensils, 
  Shirt, 
  Smartphone, 
  Watch, 
  Coffee, 
  Crosshair, 
  Stethoscope, 
  Hammer, 
  Lightbulb, 
  Scissors, 
  Car, 
  Gamepad2, 
  Heart,
  Sparkles,
  Store,
  Briefcase,
  Layers,
  Zap,
  Package,
  Dumbbell,
  GraduationCap,
  Plane,
  Music,
  Camera,
  Paintbrush
} from "lucide-react";

/**
 * Global Icon Mapper for Categories & Subcategories
 */
const ICON_MAP = {
  // Retail & Shopping
  grocery: ShoppingBag,
  kirana: ShoppingBag,
  supermarket: ShoppingBag,
  shopping: ShoppingBag,
  retail: ShoppingBag,
  
  // Food & Drink
  food: Utensils,
  restaurant: Utensils,
  bakery: Utensils,
  cafe: Coffee,
  coffee: Coffee,
  beverage: Coffee,
  
  // Fashion
  clothing: Shirt,
  fashion: Shirt,
  wear: Shirt,
  boutique: Shirt,
  textile: Shirt,
  
  // Electronics
  electronics: Smartphone,
  mobile: Smartphone,
  smartphone: Smartphone,
  gadget: Smartphone,
  computer: Smartphone,
  it: Smartphone,
  
  // Luxury & Accessories
  jewellery: Watch,
  jewel: Watch,
  watch: Watch,
  diamond: Watch,
  gold: Watch,
  
  // Health & Beauty
  health: Stethoscope,
  pharma: Stethoscope,
  medical: Stethoscope,
  doctor: Stethoscope,
  clinic: Stethoscope,
  salon: Scissors,
  parlor: Scissors,
  beauty: Scissors,
  spa: Scissors,
  cosmetic: Scissors,
  
  // Home & Construction
  hardware: Hammer,
  tool: Hammer,
  construction: Hammer,
  electrical: Lightbulb,
  lighting: Lightbulb,
  furniture: Store,
  interior: Paintbrush,
  paint: Paintbrush,
  
  // Automotive
  auto: Car,
  car: Car,
  bike: Car,
  vehicle: Car,
  service: Zap,
  
  // Lifestyle & Entertainment
  game: Gamepad2,
  toy: Gamepad2,
  hobby: Gamepad2,
  gift: Heart,
  love: Heart,
  flowers: Heart,
  sports: Dumbbell,
  gym: Dumbbell,
  fitness: Dumbbell,
  
  // Services & Professional
  education: GraduationCap,
  school: GraduationCap,
  travel: Plane,
  tour: Plane,
  music: Music,
  event: Music,
  photo: Camera,
  studio: Camera,
  service: Briefcase,
  office: Briefcase,
  
  // Generic
  other: Sparkles,
  general: Sparkles,
  misc: Package,
  category: Layers
};

/**
 * Emoji Mapper for Visual Scannability
 */
const EMOJI_MAP = {
  grocery: "🍎",
  kirana: "📦",
  supermarket: "🛒",
  restaurant: "🍲",
  bakery: "🥐",
  cafe: "☕",
  coffee: "🥤",
  clothing: "👕",
  fashion: "👗",
  boutique: "👠",
  mobile: "📱",
  electronics: "💻",
  jewellery: "💍",
  watch: "⌚",
  medical: "💊",
  doctor: "🏥",
  salon: "✂️",
  beauty: "💄",
  hardware: "🔨",
  electrical: "💡",
  furniture: "🛋️",
  auto: "🚗",
  service: "🛠️",
  game: "🎮",
  toy: "🧸",
  gift: "🎁",
  sports: "🏆",
  gym: "💪",
  education: "🎓",
  travel: "✈️",
  event: "🎈",
  photo: "📸",
  office: "💼",
  other: "✨"
};

const getEmojiByName = (name = "") => {
  const n = name.toLowerCase().trim();
  if (EMOJI_MAP[n]) return EMOJI_MAP[n];
  for (const key in EMOJI_MAP) {
    if (n.includes(key)) return EMOJI_MAP[key];
  }
  return "✨"; 
};

const getIconByName = (name = "") => {
  const n = name.toLowerCase().trim();
  
  // Check for exact match
  if (ICON_MAP[n]) return ICON_MAP[n];
  
  // Check for partial matches
  for (const key in ICON_MAP) {
    if (n.includes(key)) return ICON_MAP[key];
  }
  
  return Sparkles; // Default
};

const CategoryIcon = ({ name, size = 24, className = "", strokeWidth = 2 }) => {
  const Icon = getIconByName(name);
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
};

export default CategoryIcon;
export { getIconByName, getEmojiByName };
