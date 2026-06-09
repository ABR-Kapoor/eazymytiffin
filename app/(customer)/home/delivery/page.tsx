"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapPin, Phone, Clock, Camera,
  Navigation2, Bike, CheckCircle2, ArrowRight, Upload, ChevronLeft, LocateFixed, MoreHorizontal, User, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { PageHero } from "@/components/ui/PageHero";

type OrderItem = {
  id: string; menu_id: string; quantity: number; price: number;
  menu: { title: string; category: "veg" | "non_veg"; image_url: string | null } | null;
};

type Assignment = {
  id: string; order_id: string; status: string; eta: string | null; proof_image: string | null; created_at: string; updated_at: string;
  order: {
    user_id: string; time_slot: string; total_amount: number; notes: string | null;
    payment_status: string; payment_method: string;
    address: { type: string | null; house_flat_no: string | null; area: string; landmark: string | null; city: string; google_map_link: string | null } | null;
    user: { full_name: string; phone: string } | null;
    items: OrderItem[];
  } | null;
};

const THEME = {
  bg: "bg-[#22C55E]",
  text: "text-[#22C55E]",
  border: "border-[#22C55E]",
  lightBg: "bg-[#F0FDF4]",
};

const ETA_OPTIONS = ["5 mins", "10 mins", "15 mins", "20 mins", "30 mins", "Delayed"];

export default function DeliveryDashboard() {
  const router = useRouter();
  const storeLoading = useUserStore((s) => s.isLoading);
  const redirectedRef = useRef(false);
  const [active, setActive] = useState<Assignment[]>([]);
  const [completed, setCompleted] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<"list" | "details" | "map">("list");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"All Order" | "Active" | "Delivered">("All Order");
  const [search, setSearch] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [selectedEta, setSelectedEta] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (redirectedRef.current) return;
    if (!storeLoading) {
      const isDelBoy = useUserStore.getState().isDeliveryBoy();
      if (!isDelBoy) { redirectedRef.current = true; router.push("/home"); }
    }
  }, [storeLoading, router]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const handleProofUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/delivery/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      setProofUrl(json.url);
      showToast("Proof image attached!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload proof", "error");
    } finally {
      setUploading(false);
    }
  };

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery/assignments");
      const json = await res.json();
      if (!json.success) { showToast(json.error || "Failed to load", "error"); setLoading(false); return; }
      const today = new Date().toISOString().split("T")[0];
      const all: Assignment[] = json.data || [];
      const activeArr = all.filter((a) => a.status !== "delivered" && a.status !== "failed");
      setActive(activeArr);
      setCompleted(all.filter((a) => a.status === "delivered" && a.created_at.startsWith(today)));
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    const channelName = `delivery_rt_${Date.now()}`;
    channelRef.current = supabase.channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, fetchDeliveries)
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [fetchDeliveries]);

  const handleStatusAdvance = async (assignment: Assignment, nextStatus: string) => {
    if (nextStatus === "delivered" && !proofUrl) {
      showToast("Please upload a proof image first", "error");
      return;
    }
    if (nextStatus === "on_the_way" && !selectedEta) {
      showToast("Please select an ETA first", "error");
      return;
    }
    setActionLoading(assignment.id);
    try {
      const res = await fetch("/api/delivery/assignments", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id, updates: { status: nextStatus, proof_image: proofUrl || undefined, eta: selectedEta || undefined },
          orderId: (nextStatus === "on_the_way" || nextStatus === "delivered") ? assignment.order_id : undefined,
          orderUpdates: nextStatus === "on_the_way" ? { status: "out_for_delivery" } : nextStatus === "delivered" ? { status: "delivered" } : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) { 
        showToast(nextStatus === "delivered" ? "Delivery complete!" : "Status updated!"); 
        fetchDeliveries(); 
        if (nextStatus === "delivered") setCurrentView("list");
      }
      else showToast(json.error || "Update failed", "error");
    } finally { setActionLoading(null); }
  };

  const allOrders = [...active, ...completed];
  const displayedOrders = filterTab === "All Order" ? allOrders 
                        : filterTab === "Active" ? active 
                        : completed;

  const currentOrder = allOrders.find(a => a.id === activeOrderId);

  // -- View 1: List View --
  if (currentView === "list" || !currentOrder) {
    return (
      <div className="flex flex-col h-[calc(100dvh-56px)] bg-gray-50 overflow-hidden relative -mx-4 lg:mx-0 -mb-24">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-24 left-1/2 z-[200] -translate-x-1/2 whitespace-nowrap text-white rounded-2xl px-5 py-3 text-[13px] font-extrabold shadow-2xl transition-all ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`} style={{ animation: "fadeUp 0.3s ease both" }}>
            {toast.msg}
          </div>
        )}

        {/* Top Header */}
        <PageHero 
          themeColor="#22C55E"
          title={
            <>
              <span className="block text-white" style={{ WebkitTextStroke: "1px #222" }}>TRACK</span>
              order
            </>
          }
          subtitle="Real-time delivery updates"
        heroImages={[
          { src: "/eazymytiffin-priority-delivery.png", bg: "#FACC15" },
          { src: "/eazymytiffin-weekly-special-meal.png", bg: "#4ADE80" },
          { src: "/eazymytiffin-veg-meal-plan.png", bg: "#F472B6" },
        ]}
          search={search}
          setSearch={setSearch}
        />

        {/* List Content */}
        <div className="flex-1 px-5 pt-6 overflow-y-auto pb-10">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-3 mb-2">
            {["All Order", "Active", "Delivered"].map((tab) => (
              <button key={tab} onClick={() => setFilterTab(tab as any)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-[13px] font-bold transition-all ${filterTab === tab ? `${THEME.bg} text-white shadow-sm` : "bg-white/80 text-gray-500 border border-gray-200 shadow-sm"}`}>
                {tab}
              </button>
            ))}
          </div>

          <h3 className="font-black text-[18px] sm:text-[20px] text-[#1C1C1C] mt-5 mb-4 tracking-tight">
            Assigned Orders
          </h3>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-green-500 animate-spin" /></div>
          ) : displayedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle2 size={40} className="mb-3 opacity-20" />
              <p className="font-bold text-[14px]">No orders found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {displayedOrders.map((a) => {
                const itemsSummary = a.order?.items?.[0]?.menu?.title || "Items";
                const dateStr = new Date(a.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                const isDelivered = a.status === "delivered";

                return (
                  <div key={a.id} onClick={() => { setActiveOrderId(a.id); setProofUrl(null); setSelectedEta(null); setCurrentView("details"); }}
                    className="p-3 sm:p-4 flex gap-3 sm:gap-4 w-full bg-white relative border border-[#e8e8e8] rounded-[20px] shadow-sm transition-shadow hover:shadow-md cursor-pointer active:scale-[0.98]">
                    
                    {/* Left Side: Order & Customer Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-start">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wide capitalize ${isDelivered ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>
                          {a.status === "assigned" ? "Pending" : a.status === "on_the_way" || a.status === "arriving" ? "Processing" : "Delivered"}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">{dateStr}</span>
                      </div>
                      
                      <h3 className="font-bold text-[14px] sm:text-[16px] text-[#3D4152] m-0 mb-1 leading-snug tracking-tight truncate">
                        {itemsSummary} {a.order?.items && a.order.items.length > 1 ? `+${a.order.items.length - 1}` : ""}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-[14px] sm:text-[15px] text-[#3D4152] m-0">
                          ₹{a.order?.total_amount}
                        </p>
                        <span className="text-[11px] text-[#686B78] font-medium">• Paid</span>
                      </div>
                      
                      {/* Customer Details */}
                      <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                           <User size={12} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[12px] font-bold text-[#1A1A1A] truncate m-0 leading-tight">{a.order?.user?.full_name || "Customer"}</p>
                           <p className="text-[10px] font-medium text-gray-500 truncate m-0 leading-tight">
                             {a.order?.address?.area ? `${a.order.address.area}, ${a.order.address.city}` : "Customer Location"}
                           </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Image */}
                    <div className="w-[90px] sm:w-[100px] shrink-0 relative flex flex-col items-center">
                      <div className="w-[90px] sm:w-[100px] h-[90px] sm:h-[100px] rounded-[14px] relative overflow-hidden bg-[#F2F2F2] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100">
                        {a.order?.items?.[0]?.menu?.image_url ? (
                          <img src={a.order.items[0].menu.image_url} alt="menu" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[26px]">{a.order?.items?.[0]?.menu?.category === "veg" ? "🥬" : "🍗"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -- View 2: Order Details --
  if (currentView === "details" && currentOrder) {
    const isDelivered = currentOrder.status === "delivered";
    const statusIdx = currentOrder.status === "assigned" ? 0 : currentOrder.status === "on_the_way" ? 1 : currentOrder.status === "arriving" ? 2 : 3;

    return (
      <div className="flex flex-col h-[calc(100dvh-56px)] bg-gray-50 overflow-hidden relative -mx-4 lg:mx-0 -mb-24">
        {/* Top Header */}
        <div className={`relative ${THEME.bg} pt-8 pb-8 px-5 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden shrink-0 flex flex-col min-h-[140px]`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center mt-2">
            <h2 className="text-white text-[24px] font-black drop-shadow-sm leading-tight tracking-tight text-center">Order #{currentOrder.order_id.slice(0,6).toUpperCase()}</h2>
            <p className="text-white/90 text-[13px] font-bold mt-1 tracking-wide">
              {currentOrder.order?.user?.full_name || "Customer"} • {currentOrder.order?.address?.area || "Location"}
            </p>
          </div>
        </div>

        {/* Floating Back Button */}
        <div className="relative z-20 flex justify-center -mt-5">
          <button onClick={() => setCurrentView("list")} className="flex items-center gap-1.5 text-[#1A1A1A] bg-white shadow-md shadow-gray-200/50 border border-gray-100 px-5 py-2 rounded-full active:scale-95 transition-all text-[13px] font-bold">
            <ChevronLeft size={16} /> Back to Orders
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pt-6 overflow-y-auto pb-[120px]">
          <div className="bg-white rounded-[24px] shadow-sm p-6 mb-4">
            
            {/* Timeline */}
            <div className="relative pl-[110px] py-4">
              {[
                { label: "Assigned", desc: "Order has been assigned to you for delivery." },
                { label: "On the way", desc: "You are on the way to deliver the order." },
                { label: "Arriving", desc: "You are arriving at the customer's location." },
                { label: "Delivered", desc: "Order has been successfully delivered." }
              ].map((step, idx) => {
                const isPassed = statusIdx >= idx;
                let timeDisplay = "--:--";
                if (idx === 0) {
                  timeDisplay = new Date(currentOrder.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                } else if (idx === statusIdx) {
                  timeDisplay = new Date(currentOrder.updated_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                } else if (isPassed) {
                  timeDisplay = "Done";
                }

                return (
                  <div key={step.label} className="relative mb-12 last:mb-0">
                    <span className="absolute -left-[90px] w-[50px] text-right top-0 text-[11px] font-bold text-gray-500">
                      {timeDisplay}
                    </span>
                    <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors ${isPassed ? "border-green-500" : "border-gray-200"}`}>
                       {isPassed && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                    {idx < 3 && (
                      <div className={`absolute -left-[23px] top-4 -bottom-12 w-0.5 ${statusIdx > idx ? "bg-green-500" : "bg-gray-200"}`} />
                    )}
                    <h3 className={`font-bold text-[15px] m-0 leading-none mb-1.5 transition-colors ${isPassed ? "text-[#1A1A1A]" : "text-gray-400"}`}>{step.label}</h3>
                    <p className="text-[12px] font-medium text-gray-400 m-0 leading-snug">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details */}
          <h2 className="font-bold text-[16px] text-[#1A1A1A] mb-3 ml-2 mt-2">Customer Details</h2>
          <div className="bg-white rounded-[24px] shadow-sm p-5 flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A] text-[15px] m-0 leading-tight">{currentOrder.order?.user?.full_name || "Customer"}</p>
                  <p className="text-[12px] font-medium text-gray-500 m-0 mt-0.5">{currentOrder.order?.user?.phone || "+91 XXXXXXXXXX"}</p>
                </div>
              </div>
              <a href={`tel:${currentOrder.order?.user?.phone || ""}`} className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 transition-all active:scale-95 shadow-sm">
                <Phone size={18} />
              </a>
            </div>

            <div className="border-t border-gray-100 pt-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={16} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1A1A1A] text-[13px] m-0 mb-1 capitalize">{currentOrder.order?.address?.type || "Home"}</p>
                <p className="text-[12px] text-gray-500 m-0 leading-relaxed mb-2">
                  {currentOrder.order?.address?.house_flat_no ? currentOrder.order.address.house_flat_no + ", " : ""}
                  {currentOrder.order?.address?.area}, {currentOrder.order?.address?.city}
                </p>
                {currentOrder.order?.address?.google_map_link && (
                  <a href={currentOrder.order.address.google_map_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                    <Navigation2 size={14} /> Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Order Summary */}
          <h2 className="font-bold text-[16px] text-[#1A1A1A] mb-3 ml-2 mt-2">Order Summary</h2>
          <div className="bg-white rounded-[24px] shadow-sm p-5 flex flex-col gap-4">
             {/* Payment details */}
             <div className="flex justify-between items-center pb-4 border-b border-gray-100">
               <div>
                 <p className="font-bold text-[#1A1A1A] text-[14px] m-0">Payment</p>
                 <p className="text-[12px] font-medium text-gray-500 m-0 mt-0.5 capitalize">
                   {currentOrder.order?.payment_method === 'cod' ? 'Cash on Delivery' : 'PhonePe'}
                 </p>
               </div>
               <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize ${
                 currentOrder.order?.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
               }`}>
                 {currentOrder.order?.payment_status === 'paid' ? 'Paid' : 'Pending'}
               </span>
             </div>

             {/* Order Items */}
             <div className="flex flex-col gap-3">
               {currentOrder.order?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-[16px] overflow-hidden shadow-sm border border-gray-50">
                       {item.menu?.image_url ? (
                         <img src={item.menu.image_url} alt="menu" className="w-full h-full object-cover" />
                       ) : (
                         <span>{item.menu?.category === "veg" ? "🥬" : "🍗"}</span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-[#1A1A1A] text-[13px] truncate m-0 leading-tight">{item.menu?.title}</p>
                       <p className="text-[11px] font-bold text-gray-400 m-0 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[14px] text-[#1A1A1A] m-0 shrink-0">₹{item.price}</p>
                  </div>
               ))}
             </div>

             <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-[14px] text-gray-500">Total Amount</span>
                <span className="font-black text-[18px] text-[#1A1A1A]">₹{currentOrder.order?.total_amount}</span>
             </div>
          </div>

        </div>

        {/* Action Button (Fixed Bottom) */}
        {!isDelivered && (
          <div className="fixed bottom-[90px] left-0 right-0 px-9 lg:px-4 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[960px] pointer-events-auto">
              <button onClick={() => setCurrentView("map")}
                className={`w-full ${THEME.bg} text-white font-bold text-[14px] py-3 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.98] transition-transform`}>
                Track Order on Map
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -- View 3: Location Map --
  if (currentView === "map" && currentOrder) {
    const isActionLoading = actionLoading === currentOrder.id;
    const addr = currentOrder.order?.address;
    const mapQ = addr ? [addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ") : "";
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQ)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;

    // Map next status based on current
    let nextStatus = "on_the_way";
    let actionLabel = "Picked Up";
    if (currentOrder.status === "assigned") { nextStatus = "on_the_way"; actionLabel = "Confirm Pickup"; }
    else if (currentOrder.status === "on_the_way") { nextStatus = "arriving"; actionLabel = "Arriving Soon"; }
    else if (currentOrder.status === "arriving") { nextStatus = "delivered"; actionLabel = "Mark Delivered"; }

    return (
      <div className="relative h-[calc(100dvh-56px)] bg-gray-100 overflow-hidden -mx-4 lg:mx-0 -mb-24">
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 pt-6 bg-gradient-to-b from-white to-transparent">
          <button onClick={() => setCurrentView("details")} className="bg-white shadow-sm p-2 rounded-full text-[#1A1A1A] active:scale-95 transition-transform"><ChevronLeft size={20} /></button>
          <h1 className="font-bold text-[16px] text-[#1A1A1A] m-0 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">Location Map</h1>
          <button className="bg-white shadow-sm p-2 rounded-full text-[#1A1A1A] active:scale-95 transition-transform"><MoreHorizontal size={20} /></button>
        </div>

        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <iframe src={mapUrl} className="w-full h-full border-0" allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>

        <button className="absolute top-[100px] right-5 z-20 bg-white p-3 rounded-full shadow-md text-gray-700 active:scale-95">
           <LocateFixed size={20} />
        </button>

        {/* Shipping Details Floating Card */}
        <div className="absolute bottom-5 left-5 right-5 z-20 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-[24px] overflow-hidden flex flex-col bg-white">
          {/* Top White Card - Order Brief */}
          <div className="p-5 flex items-center gap-4 bg-white relative z-10 rounded-b-[24px]">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
             <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-2 overflow-hidden shadow-sm border border-gray-100">
                {currentOrder.order?.items?.[0]?.menu?.image_url ? (
                  <img src={currentOrder.order.items[0].menu.image_url} alt="menu" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[24px]">📦</span>
                )}
             </div>
             <div className="flex-1 mt-2">
               <h3 className="font-bold text-[16px] text-[#1A1A1A] m-0 mb-1">Shipping details</h3>
               <p className="text-[13px] font-semibold text-gray-500 m-0 truncate">Order #{currentOrder.order_id.slice(0,6).toUpperCase()}</p>
               <p className="text-[14px] font-black text-green-600 m-0 mt-1">₹{currentOrder.order?.total_amount} <span className="text-gray-400 font-medium text-[12px]">(Paid)</span></p>
             </div>
          </div>

          {/* Bottom Dark Card - Customer & Actions */}
          <div className="bg-[#1C2434] p-5 pt-7 -mt-4 flex flex-col gap-4">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center text-[18px]">
                 {currentOrder.order?.user?.full_name?.charAt(0) || "C"}
               </div>
               <div className="flex-1">
                 <p className="font-bold text-[15px] text-white m-0">{currentOrder.order?.user?.full_name || "Customer"}</p>
                 <p className="text-[12px] text-gray-400 font-medium m-0 mt-0.5 truncate max-w-[200px]">
                   {currentOrder.order?.address?.area ? `${currentOrder.order.address.area}, ${currentOrder.order.address.city}` : "Customer Location"}
                 </p>
                 <div className="flex text-amber-400 text-[10px] gap-0.5 mt-1">★★★★★</div>
               </div>
               <div className="flex gap-2">
                 {currentOrder.order?.address?.google_map_link && (
                   <a href={currentOrder.order.address.google_map_link} target="_blank" rel="noreferrer" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white active:scale-95 shadow-md">
                     <Navigation2 size={20} className="fill-white" />
                   </a>
                 )}
                 <a href={`tel:${currentOrder.order?.user?.phone}`} className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white active:scale-95 shadow-md">
                   <Phone size={20} className="fill-white" />
                 </a>
               </div>
             </div>

             {/* Proof Upload Section */}
             {nextStatus === "delivered" && (
               <div className="flex flex-col gap-2 mt-2">
                 <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) handleProofUpload(e.target.files[0]); }} />
                 {proofUrl ? (
                   <div className="relative w-full h-[140px] rounded-[12px] overflow-hidden border border-gray-700 bg-gray-800">
                     <img src={proofUrl} alt="Proof" className="w-full h-full object-cover opacity-90" />
                     <button onClick={() => setProofUrl(null)} className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors">
                       <X size={16} />
                     </button>
                     <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm">
                       ✓ Proof attached
                     </div>
                   </div>
                 ) : (
                   <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full bg-gray-800 border-2 border-gray-600 border-dashed hover:border-gray-500 text-gray-300 py-6 rounded-[12px] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all">
                     <Camera size={28} className={uploading ? "animate-pulse text-green-400" : "text-gray-400"} />
                     <span className="text-[14px] font-bold tracking-wide">{uploading ? "Uploading proof..." : "Take a Photo / Upload Proof"}</span>
                   </button>
                 )}
               </div>
             )}

             {/* ETA Selection Section */}
             {nextStatus === "on_the_way" && (
               <div className="flex flex-col gap-2 mt-2 bg-[#2A3143] p-4 rounded-[12px] border border-gray-700/50 shadow-inner">
                 <p className="text-[13px] font-bold text-gray-300 m-0 mb-1 flex items-center gap-1.5"><Clock size={14} className="text-amber-400" /> Select Estimated Arrival Time (ETA)</p>
                 <div className="flex flex-wrap gap-2">
                   {ETA_OPTIONS.map((eta) => (
                     <button
                       key={eta}
                       onClick={() => setSelectedEta(eta)}
                       className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all border ${selectedEta === eta ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105" : "bg-[#1C2434] text-gray-400 border-gray-600 hover:border-gray-500 hover:text-gray-300"}`}
                     >
                       {eta}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             {/* Action Button */}
             <button
               onClick={() => handleStatusAdvance(currentOrder, nextStatus)}
               disabled={!!isActionLoading || (nextStatus === "delivered" && !proofUrl) || (nextStatus === "on_the_way" && !selectedEta)}
               className={`w-full font-bold py-4 rounded-[12px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 text-[15px] ${
                 (nextStatus === "delivered" && !proofUrl) || (nextStatus === "on_the_way" && !selectedEta) 
                   ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
                   : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30"
               }`}>
               {isActionLoading ? "Updating..." : actionLabel}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
