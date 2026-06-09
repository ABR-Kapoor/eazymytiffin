"use client";

import { useEffect, useState, useRef } from "react";
import { useUserStore } from "@/store/userStore";
import { useOrderStore } from "@/store/orderStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  ChevronDown,
  X,
  UtensilsCrossed,
  SlidersHorizontal
} from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { FilterChips } from "@/components/ui/FilterChips";
import TiffinPlansSection from "@/components/ui/TiffinPlansSection";
import { ActiveOrderAlert } from "@/components/ui/ActiveOrderAlert";

type Menu = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  badge: string | null;
  category: "veg" | "non_veg";
  meal_type: "lunch" | "dinner" | "both";
  is_active: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isLoading = useUserStore((s) => s.isLoading);
  const { getActiveOrder } = useOrderStore();
  const activeOrder = getActiveOrder();
  const { items, addItem, updateQty, itemCount, total } = useCartStore();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isVegTheme: isVegOnly, setVegTheme: setIsVegOnly } = useThemeStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [serviceMode, setServiceMode] = useState<"food" | "tiffin">("food");
  const [placeholderText, setPlaceholderText] = useState("Eazy food");

  useEffect(() => {
    const items = ["Eazy food", "Eazy Tiffin"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % items.length;
      setPlaceholderText(items[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data } = await supabase
        .from("menus")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setMenus(data || []);
      setFilteredMenus(data || []);
      setMenusLoading(false);
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    let r = [...menus];
    if (search)
      r = r.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
      
    // Helper logic to generate deterministic attributes based on content
    const getRating = (m: Menu) => 3.8 + (m.title.length % 12) / 10; // generates ratings from 3.8 to 4.9
    const hasOffer = (m: Menu) => 
      m.title.length % 3 === 0 || 
      (m.badge && m.badge.toLowerCase().includes('offer')) || 
      (m.description && m.description.toLowerCase().includes('discount'));
      
    // Apply filters based on content
    if (activeFilter === "veg") {
      r = r.filter((m) => m.category === "veg");
    }
    if (activeFilter === "non_veg") {
      r = r.filter((m) => m.category === "non_veg");
    }
    if (activeFilter === "rating") {
      r = r.filter((m) => getRating(m) >= 4.0);
    }
    if (activeFilter === "offers") {
      r = r.filter((m) => hasOffer(m));
    }
    if (activeFilter === "filter") {
      // Dummy complex filter: only show items that have a description or a badge
      r = r.filter((m) => m.description || m.badge);
    }
    
    // Apply sorting based on content
    if (activeFilter === "sort") {
      r.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredMenus(r);
  }, [search, activeFilter, menus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({
            left: clientWidth,
            behavior: "smooth",
          });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const qty = (id: string) =>
    items.find((i) => i.menu_id === id)?.quantity || 0;

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good Evening";
  else greeting = "Good Night";

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Guest";

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
        }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-[#FC8019]/20 border-t-[#FC8019] animate-spin" />
      </div>
    );
  }

  const themeBg = isVegOnly ? "bg-[#0d5c3d]" : "bg-[#E8392A]";

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-4">
      {/* 1. New Swiggy-like Hero Section */}
      <div className="relative bg-[#140019] pt-[80px] pb-0 px-0 -mx-4 lg:mx-0 rounded-b-[20px] shadow-sm">


        {/* Service Tabs */}
        {/* Service Tabs */}
        <div className="flex w-full relative z-10 items-end" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
          {/* Eazy Food Tab */}
          <button 
            onClick={() => setServiceMode("food")}
            className="flex-1 flex flex-col items-center justify-end relative transition-all duration-300"
            style={{
              height: "104px",
              border: "none",
              cursor: "pointer",
              zIndex: serviceMode === "food" ? 20 : 10,
              paddingBottom: "16px",
              background: "transparent",
              marginRight: "-6px",
            }}
          >
            {/* Slanted Background */}
            <div style={{
              position: "absolute",
              top: "-8px", left: 0, right: 0, bottom: 0,
              transform: "perspective(120px) rotateX(12deg)",
              transformOrigin: "bottom",
              borderRadius: "28px 28px 0 0",
              background: serviceMode === "food" ? "#431252" : "linear-gradient(to right, #310c3d, #140019)",
              borderTop: `1px solid ${serviceMode === "food" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderLeft: `1px solid ${serviceMode === "food" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderRight: `1px solid ${serviceMode === "food" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              boxShadow: serviceMode === "food" ? "0 -4px 16px rgba(255,255,255,0.2), inset 0 4px 12px rgba(255,255,255,0.1)" : "none",
              zIndex: -1,
              transition: "all 0.3s ease"
            }} />
            
            {/* Glow under emoji */}
            {serviceMode === "food" && (
              <div style={{
                position: "absolute",
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(255,200,100,0.15)",
                filter: "blur(14px)",
                pointerEvents: "none",
              }} />
            )}
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hamburger.png" alt="Food" width={44} height={44} className="w-[44px] h-[44px] object-contain drop-shadow-xl mb-1.5" />
            <span style={{
              fontSize: "14px",
              fontWeight: 800,
              color: serviceMode === "food" ? "#ffffff" : "rgba(255,255,255,0.6)",
              letterSpacing: "0.02em",
            }}>Eazy Food</span>
          </button>
          
          {/* Eazy Tiffin Tab */}
          <button 
            onClick={() => setServiceMode("tiffin")}
            className="flex-1 flex flex-col items-center justify-end relative transition-all duration-300"
            style={{
              height: "104px",
              border: "none",
              cursor: "pointer",
              zIndex: serviceMode === "tiffin" ? 20 : 10,
              paddingBottom: "16px",
              background: "transparent",
              marginLeft: "-6px",
            }}
          >
            {/* Slanted Background */}
            <div style={{
              position: "absolute",
              top: "-8px", left: 0, right: 0, bottom: 0,
              transform: "perspective(120px) rotateX(12deg)",
              transformOrigin: "bottom",
              borderRadius: "28px 28px 0 0",
              background: serviceMode === "tiffin" ? "#431252" : "linear-gradient(to right, #140019, #310c3d)",
              borderTop: `1px solid ${serviceMode === "tiffin" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderLeft: `1px solid ${serviceMode === "tiffin" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderRight: `1px solid ${serviceMode === "tiffin" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              boxShadow: serviceMode === "tiffin" ? "0 -4px 16px rgba(255,255,255,0.2), inset 0 4px 12px rgba(255,255,255,0.1)" : "none",
              zIndex: -1,
              transition: "all 0.3s ease"
            }} />

            {/* Glow under emoji */}
            {serviceMode === "tiffin" && (
              <div style={{
                position: "absolute",
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(100,180,255,0.15)",
                filter: "blur(14px)",
                pointerEvents: "none",
              }} />
            )}
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Pot%20of%20Food.png" alt="Tiffin" width={44} height={44} className="w-[44px] h-[44px] object-contain drop-shadow-xl mb-[2px]" />
            <span style={{
              fontSize: "14px",
              fontWeight: 800,
              color: serviceMode === "tiffin" ? "#ffffff" : "rgba(255,255,255,0.6)",
              letterSpacing: "0.02em",
            }}>Eazy Tiffin</span>
          </button>
        </div>

        {/* Search Bar & Veg Toggle container */}
        <div className="bg-[#431252] pt-5 pb-6 px-4 relative z-20 shadow-md" style={{ borderRadius: serviceMode === "food" ? "0 24px 24px 24px" : "24px 0 24px 24px" }}>
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 bg-white rounded-[16px] px-4 h-[52px] flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <Search size={22} className="text-[#6B7280] mr-3 shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder={`Search for '${placeholderText}'`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[15px] text-[#4B5563] placeholder-[#6B7280] font-medium min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mr-3 text-[#93959F]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Compact Veg Toggle */}
            <button
              onClick={() => {
                setIsVegOnly(!isVegOnly);
                setActiveFilter(!isVegOnly ? "veg" : "all");
              }}
              className="bg-white rounded-[16px] p-2 flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-colors shrink-0 min-w-[56px] h-[52px]"
            >
              <span className="text-[11px] font-bold text-gray-600 tracking-wide mb-1 leading-none">VEG</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-[1.5px] border-[#0F8A65] flex items-center justify-center rounded-[3px]">
                  <div className="w-1.5 h-1.5 bg-[#0F8A65] rounded-full" />
                </div>
                <div className={`w-7 h-4 rounded-full relative transition-colors duration-300 ${isVegOnly ? 'bg-[#0F8A65]' : 'bg-[#e2e2e7]'}`}>
                  <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isVegOnly ? 'left-[14px]' : 'left-[2px]'}`} />
                </div>
              </div>
            </button>
          </div>

          {/* Promo Banners */}
          <div className="mt-6">
            {/* Big Banner Redesigned */}
            <div className="w-full relative flex flex-col items-center justify-center mb-6 mt-2 min-h-[160px] py-2">
              <div className="flex flex-col items-center justify-center relative z-10 w-full px-2">
                <div style={{
                  color: "#FFD700",
                  fontSize: "clamp(26px, 7.5vw, 36px)",
                  fontWeight: 900,
                  lineHeight: 1,
                  fontFamily: "'Arial Black', Impact, sans-serif",
                  WebkitTextStroke: "1px #b71c1c",
                  textShadow: "0 1px 0 #c62828, 0 2px 0 #c62828, 0 3px 0 #c62828, 0 4px 0 #c62828, 0 5px 0 #c62828, 0 6px 0 #c62828, 0 7px 0 #c62828",
                  transform: "rotate(-2deg)",
                  zIndex: 20,
                  position: "relative",
                  marginTop: "30px"
                }}>
                  <span className="relative inline-block">
                    {/* Top Chef Hat Icon */}
                    <div className="absolute left-[45%] bottom-[85%] -translate-x-1/2 z-10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-[55px] h-[55px] drop-shadow-xl -rotate-[20deg] hover:-rotate-[10deg] transition-transform origin-bottom">
                        {/* Red Drop Shadow Offset */}
                        <g transform="translate(0, 4)">
                          <path d="M 25 70 C 0 70, -5 30, 30 35 C 30 0, 70 0, 70 35 C 105 30, 100 70, 75 70 Z" fill="#C62828" />
                          <rect x="25" y="65" width="50" height="22" rx="4" fill="#C62828" />
                        </g>
                        
                        {/* Yellow Primary Layer */}
                        <g>
                          <path d="M 25 70 C 0 70, -5 30, 30 35 C 30 0, 70 0, 70 35 C 105 30, 100 70, 75 70 Z" fill="#FFD700" />
                          <rect x="25" y="65" width="50" height="22" rx="4" fill="#FFD700" />
                          
                          {/* Hat Base Pleats (Shadowed indents) */}
                          <rect x="36" y="65" width="4" height="22" fill="#C62828" opacity="0.4" />
                          <rect x="48" y="65" width="4" height="22" fill="#C62828" opacity="0.4" />
                          <rect x="60" y="65" width="4" height="22" fill="#C62828" opacity="0.4" />
                        </g>
                      </svg>
                    </div>
                    GHAR
                  </span>
                  <span> KA KHANA</span>
                </div>
              </div>
              <div className="mt-6 relative z-30">
                <Link href="/food" className="px-6 py-1.5 border-[2px] border-[#FFD700] rounded-[20px] flex items-center justify-center bg-[#140019]/40 backdrop-blur-sm cursor-pointer hover:bg-[#FFD700]/10 transition-colors">
                  <span className="text-[#FFD700] text-[13px] font-black uppercase tracking-[0.15em]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Subscribe Now</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-5 px-6">
              <div className="h-[1px] flex-1 bg-white/20" />
              <span className="text-white/80 text-[11px] font-bold tracking-widest uppercase">Exciting Tiffin Offers</span>
              <div className="h-[1px] flex-1 bg-white/20" />
            </div>
            
            {/* Small Cards Row */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 px-6">
              {[
                { title: "Trial Meal\nAt ₹49", subtitle: "SUPER\nOFFER", color: "bg-[#7B1FA2]", accent: "#E1BEE7" },
                { title: "Up to 20% OFF\nOn Monthly", subtitle: "", color: "bg-[#6A1B9A]", icon: "🎫" },
                { title: "Flat ₹100 OFF\nOn 1st Order", subtitle: "", color: "bg-[#4A148C]", icon: "🪙" },
                { title: "Free Delivery\nEveryday", subtitle: "", color: "bg-[#311B92]", icon: "🚚" },
              ].map((card, i) => (
                <div key={i} className={`shrink-0 w-[115px] h-[140px] rounded-[20px] ${card.color} p-3 flex flex-col justify-between snap-start relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/10`}>
                  <div className="text-white font-bold text-[13px] leading-[1.2] z-10 whitespace-pre-line drop-shadow-sm">{card.title}</div>
                  {card.subtitle && <div className="text-white font-black text-[24px] leading-[0.9] z-10 whitespace-pre-line tracking-tighter mt-auto drop-shadow-md italic" style={{ fontFamily: 'Impact, sans-serif' }}>{card.subtitle}</div>}
                  {card.icon && <div className="text-[48px] absolute -bottom-4 -right-4 opacity-80 rotate-12 drop-shadow-md">{card.icon}</div>}
                  
                  {/* Decorative elements for first card */}
                  {i === 0 && <div className="absolute bottom-1.5 left-2 right-2 flex justify-between"><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span></div>}
                  {i === 1 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <div className="bg-yellow-400 text-black text-[28px] font-black leading-none px-1 py-1 rounded shadow-sm rotate-[-5deg]">%</div>
                      <div className="bg-yellow-400 text-black text-[28px] font-black leading-none px-1 py-1 rounded shadow-sm rotate-[5deg]">%</div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <div className="bg-yellow-400 text-black text-[28px] font-black leading-none px-1 py-1 rounded-full shadow-sm">₹</div>
                      <div className="bg-yellow-400 text-black text-[28px] font-black leading-none px-1 py-1 rounded-full shadow-sm ml-[-10px] z-0">₹</div>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute -bottom-2 -left-2 text-[60px] opacity-20">☁️</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 relative z-20">
        {/* Active Order Alert */}
        <div className="mb-4">
          <ActiveOrderAlert />
        </div>

        {/* 4. Feature Banners Carousel */}
        <div className="mb-6">
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth">
            {[
              {
                id: "subscription",
                title: "Monthly Subs",
                subtitle: "Save up to 20%",
                tag: "Popular",
                href: "/subscription",
                color: "bg-gradient-to-br from-[#E8392A] to-[#C02619]",
                img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=250&auto=format&fit=crop",
              },
              {
                id: 2,
                title: "Veg Tiffin",
                subtitle: "Homestyle food",
                tag: "From ₹99/meal",
                href: "/food?category=veg",
                color: "bg-gradient-to-br from-[#1BA672] to-[#10704B]",
                img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=250&auto=format&fit=crop",
              },
              {
                id: 3,
                title: "Non-Veg Tiffin",
                subtitle: "Premium quality",
                tag: "Fresh chicken",
                href: "/food?category=non-veg",
                color: "bg-gradient-to-br from-[#2563EB] to-[#1E3A8A]",
                img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=250&auto=format&fit=crop",
              },
              {
                id: "trial",
                title: "Trial Meal",
                subtitle: "Try before buy",
                tag: "Flat ₹50 Off",
                href: "/food/checkout",
                color: "bg-gradient-to-br from-[#9333EA] to-[#6B21A8]",
                img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=250&auto=format&fit=crop",
              },
            ].map((banner) => (
              <Link
                key={banner.id}
                href={banner.href}
                className={`${banner.color} rounded-[28px] p-5 flex relative overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.12)] shrink-0 w-[calc(100dvw-32px)] sm:w-[340px] h-[160px] snap-center group`}
              >
                <div className="relative z-10 w-[65%] sm:w-[60%] flex flex-col justify-center">
                  <h3 className="font-black text-[20px] sm:text-[22px] text-white leading-tight mb-1 drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] font-extrabold text-white/90 tracking-widest mb-3">
                    {banner.subtitle}
                  </p>
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30 self-start">
                    <span className="text-white font-bold text-[11px]">{banner.tag}</span>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-[45%] sm:w-[150px] z-0 rounded-l-[40px] overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 z-10 mix-blend-multiply" />
                  <img
                    src={banner.img}
                    alt={banner.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

        {/* 4.5 Dietary Preferences Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3" style={{ gridTemplateRows: "auto auto" }}>
          <Link href="/food?filter=veg" className="relative bg-green-50 rounded-[24px] p-4 flex flex-col justify-between overflow-hidden shadow-sm border border-green-100 group row-span-2 min-h-[200px] hover:shadow-md transition-shadow">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-80" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/food.png')" }} />
            <div className="z-10">
              <h3 className="font-black text-[20px] text-[#282c3f] leading-tight tracking-tight">Pure Veg</h3>
              <p className="text-[12px] font-medium text-gray-500 leading-snug mt-1.5 pr-8">100% Vegetarian</p>
              <div className="mt-3 inline-flex justify-center w-[80px] items-center gap-1.5 bg-white/60 backdrop-blur-sm py-1 rounded-md border border-[#1BA672]/20">
                <div className="w-[12px] h-[12px] border border-[#1BA672] flex items-center justify-center rounded-[2px] shrink-0 bg-white">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#1BA672]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#1BA672] tracking-wide uppercase">Veg</span>
              </div>
            </div>
            {/* Circular Image floating in bottom right */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 sm:w-40 sm:h-40">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop" 
                alt="Pure Veg Bowl"
                className="w-full h-full object-cover rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </Link>

          <Link href="/food?filter=mix" className="relative bg-orange-50 rounded-[20px] p-3 pl-4 flex flex-col justify-center overflow-hidden shadow-sm border border-orange-100 group min-h-[95px] hover:shadow-md transition-shadow">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-80" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/food.png')" }} />
            <div className="z-10 relative">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-[17px] text-[#282c3f] leading-tight tracking-tight">Mix Veg</h3>
                <div className="w-[14px] h-[14px] border border-[#1BA672] flex items-center justify-center rounded-[3px] shrink-0 bg-white">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#1BA672]" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 mt-1 whitespace-nowrap overflow-visible relative z-20">Best of both</p>
            </div>
            {/* Image overlapping right side */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] z-0">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop" 
                alt="Mix Veg"
                className="w-full h-full object-cover rounded-full shadow-md group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </Link>

          <Link href="/food?filter=nonveg" className="relative bg-red-50 rounded-[20px] p-3 pl-4 flex flex-col justify-center overflow-hidden shadow-sm border border-red-100 group min-h-[95px] hover:shadow-md transition-shadow">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-80" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/food.png')" }} />
            <div className="z-10 relative">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-black text-[17px] text-[#282c3f] leading-tight tracking-tight">Non Veg</h3>
                <div className="w-[14px] h-[14px] border border-[#E23744] flex items-center justify-center rounded-[3px] shrink-0 bg-white">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#E23744]" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 whitespace-nowrap overflow-visible relative z-20">Meat lovers</p>
            </div>
            {/* Image overlapping right side */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[60px] h-[60px] sm:w-[72px] sm:h-[72px]">
              <img 
                src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop" 
                alt="Non Veg Chicken"
                className="w-full h-full object-cover rounded-full shadow-md group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Service Mode Toggle Banner (Moved to Hero Section) */}

      {/* 6. Dynamic Content Based on Service Mode */}
      {serviceMode === "food" ? (
        <div className="pt-4 pb-6">
          <h3 className="font-black text-[22px] text-[#1C1C1C] mb-5 tracking-tight">
            Dishes to explore
          </h3>
          
          <div className="mb-6 sticky top-[56px] bg-[#f8f9fa] py-2 z-30 -mx-4 px-4">
            <FilterChips
              options={[
                { value: "all", label: "All" },
                { value: "filter", label: <span className="flex items-center gap-1">Filter <SlidersHorizontal size={14} className="ml-1 text-slate-700" /></span> },
                { value: "sort", label: <span className="flex items-center gap-1">Sort By <ChevronDown size={14} className="ml-0.5 text-slate-700" /></span> },
                { value: "rating", label: "Rating 4.0+" },
                { value: "veg", label: "Pure Veg" },
                { value: "non_veg", label: "Non-Veg" },
                { value: "offers", label: "Offers" },
              ]}
              activeValue={activeFilter === "all" ? "all" : activeFilter}
              onChange={(val) => { setActiveFilter(val as any); if (val === "veg") setIsVegOnly(true); else if (val === "non_veg") setIsVegOnly(false); }}
            />
          </div>

          {menusLoading ? (
            <div className="flex flex-col gap-6">
              <div className="w-full h-[180px] bg-slate-200 rounded-[20px] animate-pulse" />
              <div className="w-full h-[180px] bg-slate-200 rounded-[20px] animate-pulse" />
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[24px] shadow-sm border border-slate-100">
              <UtensilsCrossed
                size={48}
                className="text-[#93959F] mx-auto mb-4"
              />
              <p className="text-[16px] font-bold text-[#1C1C1C]">
                No dishes found
              </p>
              <p className="text-[14px] text-[#686B78] mt-1">Try changing your filters or search term</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredMenus.map((menu) => (
                <FoodCard
                  key={menu.id}
                  menu={menu}
                  quantity={qty(menu.id)}
                  price={120} // placeholder since actual schema might not have price directly
                  onAdd={() =>
                    addItem({
                      menu_id: menu.id,
                      title: menu.title,
                      price: 120,
                      category: menu.category,
                      image_url: menu.image_url,
                      badge: menu.badge,
                    })
                  }
                  onUpdateQty={(val) => updateQty(menu.id, val)}
                  layout="horizontal"
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="pt-4 pb-6">
          {/* Render the full Tiffin Subscription UI instead of a placeholder */}
          <TiffinPlansSection />
        </div>
      )}

      {/* Floating Cart */}
      {itemCount() > 0 && (
        <div className="fixed bottom-[84px] left-0 right-0 px-4 z-[100] pointer-events-none transition-transform translate-y-0">
          <div className="max-w-[960px] mx-auto pointer-events-auto">
            <button
              onClick={() => router.push("/food/checkout")}
              className="w-full flex items-center justify-between bg-[#1BA672] text-white rounded-2xl px-4 sm:px-5 py-3 sm:py-4 cursor-pointer shadow-[0_8px_24px_rgba(27,166,114,0.4)] border-none hover:bg-[#14835A] transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-black text-[13px] sm:text-[15px] text-left m-0 tracking-wide truncate">
                  {itemCount()} item{itemCount() > 1 ? "s" : ""} added
                </p>
                <p className="text-[11px] sm:text-[12px] text-white/90 font-bold m-0 text-left truncate">
                  ₹{total()} • No extra hidden charges
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 font-black text-[13px] sm:text-[15px] tracking-wide shrink-0">
                View Cart <ChevronRight size={18} className="sm:mt-[-1px]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

