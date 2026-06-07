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
  Truck,
  X,
  MapPin,
  User,
  UtensilsCrossed,
  Mic,
  Navigation,
  Zap,
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
      {/* 1. Header Area with Background */}
      <div className={`relative ${themeBg} pt-6 pb-10 px-4 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden -mx-4 lg:mx-0`}>
        {/* Food Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />
        
        {/* Greeting Section */}
        <div className="relative z-10 mb-5 mt-2">
          <h2 className="text-white text-[26px] font-black drop-shadow-sm leading-tight tracking-tight">
            {greeting}, {firstName}!
          </h2>
          <p className="text-white/95 text-[14px] font-bold mt-1 tracking-wide">
            What are you craving today?
          </p>
        </div>

        {/* 2. Search Bar Overlaid */}
        <div className="relative z-10 flex items-center bg-white rounded-[16px] px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <input
            type="text"
            placeholder="Search for restaurants, dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1C1C1C] placeholder-[#93959F] font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mr-3 text-[#93959F]"
            >
              <X size={16} />
            </button>
          )}
          <div className="w-[1px] h-5 bg-slate-200 mx-2" />
          <Search size={20} className="text-[#FC8019] ml-2 mr-1 shrink-0" />
        </div>

        {/* Veg/Non-Veg Toggle */}
        <div className="relative z-10 flex justify-center mt-5">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex items-center gap-1 shadow-sm border border-white/10">
            <button
              onClick={() => { setIsVegOnly(true); setActiveFilter("veg"); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] tracking-wide transition-all ${
                isVegOnly ? "bg-white text-slate-800 shadow-md font-bold" : "text-white font-semibold"
              }`}
            >
              <div className="w-3.5 h-3.5 border-[1.5px] border-green-600 flex items-center justify-center rounded-[3px] bg-white">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              </div>
              Veg Only
            </button>
            <button
              onClick={() => { setIsVegOnly(false); setActiveFilter("non_veg"); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] tracking-wide transition-all ${
                !isVegOnly ? "bg-white text-slate-800 shadow-md font-bold" : "text-white font-semibold"
              }`}
            >
              <div className="w-3.5 h-3.5 border-[1.5px] border-red-600 flex items-center justify-center rounded-[3px] bg-white">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              Non-Veg
            </button>
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
      <div className="px-0 sm:px-4 mb-6">
        <div className="grid grid-cols-2 gap-3" style={{ gridTemplateRows: "auto auto" }}>
          <Link href="/food?filter=veg" className="relative bg-green-50 rounded-[24px] p-4 flex flex-col justify-between overflow-hidden shadow-sm border border-green-100 group row-span-2 min-h-[200px] hover:shadow-md transition-shadow">
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

      {/* 5. Service Mode Toggle Banner */}
      <div className="mt-2 mb-6">
        <div className="relative bg-gradient-to-br from-[#0284C7] to-[#0369A1] pt-6 pb-8 px-5 rounded-[32px] shadow-md overflow-hidden">
          {/* Native CSS Diagonal Stripes Pattern */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_2px,transparent_2px,transparent_12px)] pointer-events-none" />

          {/* Dynamic Corner Images */}
          {/* Top Left */}
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" 
            alt="Burger"
            className={`absolute -top-10 -left-10 sm:-top-16 sm:-left-16 w-28 h-28 sm:w-52 sm:h-52 rounded-full shadow-2xl object-cover border-[6px] border-white/10 transition-all duration-700 ease-in-out ${serviceMode === "food" ? "opacity-100 scale-100 rotate-[12deg]" : "opacity-0 scale-50 -rotate-12"}`} 
          />
          <img 
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=300&auto=format&fit=crop" 
            alt="Thali"
            className={`absolute -top-10 -left-10 sm:-top-16 sm:-left-16 w-28 h-28 sm:w-52 sm:h-52 rounded-full shadow-2xl object-cover border-[6px] border-white/10 transition-all duration-700 ease-in-out ${serviceMode === "tiffin" ? "opacity-100 scale-100 -rotate-[12deg]" : "opacity-0 scale-50 rotate-12"}`} 
          />
          
          {/* Bottom Right */}
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop" 
            alt="Pizza"
            className={`absolute -bottom-12 -right-12 sm:-bottom-24 sm:-right-24 w-36 h-36 sm:w-64 sm:h-64 rounded-full shadow-2xl object-cover border-[6px] border-white/10 transition-all duration-700 ease-in-out ${serviceMode === "food" ? "opacity-100 scale-100 -rotate-[15deg]" : "opacity-0 scale-50 rotate-12"}`} 
          />
          <img 
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=300&auto=format&fit=crop" 
            alt="Curry"
            className={`absolute -bottom-12 -right-12 sm:-bottom-24 sm:-right-24 w-36 h-36 sm:w-64 sm:h-64 rounded-full shadow-2xl object-cover border-[6px] border-white/10 transition-all duration-700 ease-in-out ${serviceMode === "tiffin" ? "opacity-100 scale-100 rotate-[15deg]" : "opacity-0 scale-50 -rotate-12"}`} 
          />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="font-black text-[20px] sm:text-[22px] text-white tracking-tight mb-1 drop-shadow-sm">
              Choose Your Experience
            </h3>
            <p className="text-[12px] sm:text-[13px] text-white/95 font-semibold mb-5 leading-snug max-w-[260px] sm:max-w-[300px]">
              Order instantly or subscribe to daily homestyle meals.
            </p>

            {/* Small Responsive Toggle Switch */}
            <div className="bg-white/20 backdrop-blur-md p-1 rounded-full flex items-center shadow-inner relative w-[200px] sm:w-[240px] border border-white/20">
              {/* Sliding Background */}
              <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: serviceMode === "food" ? "4px" : "calc(50%)",
                }}
              />
              
              <button
                onClick={() => setServiceMode("food")}
                className={`flex-1 flex items-center justify-center py-1.5 sm:py-2 relative z-10 transition-colors duration-300 ${
                  serviceMode === "food" ? "text-[#1C1C1C]" : "text-white drop-shadow-sm"
                }`}
              >
                <span className="font-extrabold text-[12px] tracking-wide">Eazy Food</span>
              </button>

              <button
                onClick={() => setServiceMode("tiffin")}
                className={`flex-1 flex items-center justify-center py-1.5 sm:py-2 relative z-10 transition-colors duration-300 ${
                  serviceMode === "tiffin" ? "text-[#1C1C1C]" : "text-white drop-shadow-sm"
                }`}
              >
                <span className="font-extrabold text-[12px] tracking-wide">Eazy Tiffin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
        <div className="-mt-6 pb-6">
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

