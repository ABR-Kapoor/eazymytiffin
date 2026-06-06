"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, MapPin, ChevronDown, ChevronRight, Check, Leaf, Drumstick, Home, Building2, Briefcase, Wallet, Clock, IndianRupee } from "lucide-react";

type Address = { id: string; type: "home" | "hostel" | "office"; house_flat_no: string | null; landmark: string | null; area: string; city: string; is_default: boolean; };

const ADDR_ICONS: Record<string, React.ReactNode> = { home: <Home size={18} />, hostel: <Building2 size={18} />, office: <Briefcase size={18} /> };

function SlideToPayButton({ grand, placing, onSlideComplete }: { grand: number; placing: boolean; onSlideComplete: () => void }) {
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placing) setDrag(0);
  }, [placing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (placing) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || placing) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const sliderWidth = 46;
    const maxDrag = containerRect.width - sliderWidth - 12;
    let newDrag = e.clientX - containerRect.left - (sliderWidth / 2);
    if (newDrag < 0) newDrag = 0;
    if (newDrag > maxDrag) newDrag = maxDrag;
    setDrag(newDrag);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || placing) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const sliderWidth = 46;
    const maxDrag = containerRect.width - sliderWidth - 12;
    
    if (drag > maxDrag * 0.8) {
      setDrag(maxDrag);
      onSlideComplete();
    } else {
      setDrag(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full relative h-[56px] bg-[#1ea463] rounded-[16px] overflow-hidden flex items-center justify-center group shadow-[0_8px_20px_rgb(30,164,99,0.25)] touch-none"
    >
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${drag}px)`, transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        className="absolute left-1.5 top-1.5 bottom-1.5 w-[46px] bg-white rounded-[12px] flex items-center justify-center shadow-sm z-20 cursor-grab active:cursor-grabbing"
      >
        <ChevronRight size={20} className="text-[#1ea463] -mr-2" strokeWidth={3} />
        <ChevronRight size={20} className="text-[#1ea463] opacity-40" strokeWidth={3} />
      </div>
      
      <div 
        className="absolute left-0 top-0 bottom-0 bg-[#178550] z-10"
        style={{ width: drag + 23 + 6, transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
      
      <span className={`font-extrabold text-white text-[16px] tracking-wide ml-8 z-30 flex items-center gap-1.5 transition-opacity duration-300 ${drag > 40 ? "opacity-0" : "opacity-100"}`}>
        {placing ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
        ) : (
            `Slide to Pay | ₹${grand}`
        )}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { items, removeItem, updateQty, subtotal, clearCart, timeSlot, setTimeSlot, addressId, setAddressId, paymentMethod, setPaymentMethod } = useCartStore();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modals/Sheets
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  useEffect(() => { if (items.length === 0) router.push("/food"); }, [items]);

  useEffect(() => {
    const fetchAddr = async () => {
      if (!user) return;
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      setAddresses(data || []);
      if (data && data.length > 0 && !addressId) setAddressId(data.find((a) => a.is_default)?.id || data[0].id);
    };
    fetchAddr();
  }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handlePlaceOrder = async () => {
    if (!user) { router.push("/sign-in"); return; }
    if (!addressId) { showToast("Please select a delivery address"); return; }
    if (!timeSlot) { showToast("Please select a time slot"); return; }
    if (!paymentMethod) { showToast("Please select a payment method"); setShowPaymentOptions(true); return; }
    
    setPlacing(true);
    try {
      const res = await fetch("/api/food-orders", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          addressId, 
          timeSlot, 
          paymentMethod, 
          items: items.map((i) => ({ menu_id: i.menu_id, quantity: i.quantity, price: i.price })), 
          subtotal: subtotal(), 
          notes: "" 
        }) 
      });
      const result = await res.json();
      if (result.success) { 
        if (paymentMethod === "phonepe" && result.redirectUrl) { 
          clearCart(); 
          window.location.href = result.redirectUrl; 
        } else { 
          clearCart(); 
          router.push("/orders"); 
        } 
      } else {
        showToast(result.error || "Failed to place order.");
      }
    } catch { 
      showToast("Network error."); 
    } finally { 
      setPlacing(false); 
    }
  };

  const grand = subtotal();
  const currentAddress = addresses.find(a => a.id === addressId);
  const addrString = currentAddress ? [currentAddress.house_flat_no, currentAddress.landmark, currentAddress.area].filter(Boolean).join(", ") : "Select an address";

  return (
    <div className="min-h-[100dvh] pb-[120px] relative">
      {toast && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white rounded-full px-5 py-3 text-[13px] font-bold shadow-2xl transition-all whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Delivery ETA Card */}
      <button onClick={() => setShowAddressOptions(!showAddressOptions)} className="w-full sm:w-[calc(100%-16px)] mx-0 sm:mx-2 mt-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-[16px] p-4 flex gap-3 shadow-sm border border-orange-100 text-left active:scale-[0.98] transition-transform">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Home size={18} className="text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[15px] text-gray-900 flex items-center gap-1.5">
              Delivery to {currentAddress?.type ? <span className="capitalize">{currentAddress.type}</span> : "Home"}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showAddressOptions ? "rotate-180" : ""}`} />
            </h3>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5 truncate font-medium">{addrString}</p>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-orange-100/80 px-2 py-0.5 rounded-md">
            <Clock size={12} className="text-orange-600" />
            <p className="text-[11px] font-bold text-orange-600 tracking-wide uppercase">Delivery time has been updated!</p>
          </div>
        </div>
      </button>

      {/* Address Options Dropdown */}
      {showAddressOptions && (
        <div className="bg-white mx-0 sm:mx-2 mt-2 rounded-[16px] shadow-sm border border-gray-100 overflow-hidden transition-all origin-top">
          <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[13px] text-gray-700 flex justify-between items-center">
            Select Delivery Address
            <button onClick={() => router.push("/profile/addresses")} className="text-orange-600 text-[12px]">Add New</button>
          </div>
          {addresses.map(addr => (
            <button key={addr.id} onClick={() => { setAddressId(addr.id); setShowAddressOptions(false); }} className={`w-full flex items-start gap-3 p-4 border-b border-gray-50 text-left ${addressId === addr.id ? 'bg-orange-50/50' : 'bg-white'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${addressId === addr.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                {ADDR_ICONS[addr.type] || <MapPin size={18} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[14px] text-gray-900 capitalize">{addr.type} {addr.is_default && <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Default</span>}</p>
                <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{[addr.house_flat_no, addr.landmark, addr.area].filter(Boolean).join(", ")}</p>
              </div>
              {addressId === addr.id && <Check size={18} className="text-orange-600" />}
            </button>
          ))}
        </div>
      )}

      {/* Delivery Time Slot */}
      <div className="bg-white mx-0 sm:mx-2 mt-4 rounded-[20px] shadow-sm border border-gray-100 p-4">
        <h3 className="font-bold text-[14px] text-gray-900 mb-3 flex items-center gap-1.5"><Clock size={16} className="text-gray-400" /> Select Delivery Time</h3>
        <div className="flex gap-3">
          {(["lunch", "dinner"] as const).map(slot => (
            <button key={slot} onClick={() => setTimeSlot(slot)} className={`flex-1 py-3 px-2 rounded-[12px] border ${timeSlot === slot ? 'border-orange-500 bg-orange-50/50 shadow-sm' : 'border-gray-200 bg-white'} transition-all text-center relative overflow-hidden active:scale-95`}>
              <p className="font-bold text-[13px] text-gray-900 capitalize">{slot}</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5">{slot === "lunch" ? "12 PM - 2 PM" : "7 PM - 9 PM"}</p>
              {timeSlot === slot && <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500 rounded-bl-[16px] flex items-start justify-end p-1.5"><Check size={12} className="text-white" /></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Items Card */}
      <div className="bg-white mx-0 sm:mx-2 mt-4 rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        {items.map((item, i) => (
          <div key={item.menu_id} className={`flex gap-3 p-4 relative ${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
            {/* Veg/NonVeg Icon */}
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${item.category === "veg" ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"}`}>
               <div className={`w-2 h-2 rounded-full ${item.category === "veg" ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="font-bold text-[14px] text-gray-900 leading-snug">{item.title}</h4>
              <p className="text-[12px] font-bold text-gray-900 mt-1">₹{item.price}</p>
              <button className="text-[11px] font-bold text-gray-500 mt-2 flex items-center gap-0.5 active:text-gray-700">
                Customize <ChevronDown size={14} />
              </button>
            </div>

            {/* Qty Pill */}
            <div className="flex flex-col items-end justify-start gap-3">
              <div className="flex items-center border border-green-200 rounded-[10px] bg-green-50/50 shadow-sm overflow-hidden h-[34px] w-[84px]">
                <button onClick={() => updateQty(item.menu_id, item.quantity - 1)} className="flex-1 h-full flex items-center justify-center text-green-700 font-bold active:bg-green-100 transition-colors"><Minus size={14}/></button>
                <span className="font-black text-[13px] text-green-700 w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.menu_id, item.quantity + 1)} className="flex-1 h-full flex items-center justify-center text-green-700 font-bold active:bg-green-100 transition-colors"><Plus size={14}/></button>
              </div>
              <p className="font-extrabold text-[14px] text-gray-900">₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
        
        {/* Actions Row */}
        <div className="border-t border-gray-100 bg-gray-50/30">
          <button onClick={() => router.push("/food")} className="w-full flex items-center justify-between p-4 border-b border-gray-100 text-[13px] font-bold text-gray-700 active:bg-gray-100 transition-colors">
            Add more items <Plus size={18} className="text-gray-400"/>
          </button>
          <button className="w-full flex items-center justify-between p-4 text-[13px] font-bold text-gray-700 active:bg-gray-100 transition-colors">
            Add cooking requests <Plus size={18} className="text-gray-400"/>
          </button>
        </div>
      </div>

      {/* Bill Summary */}
      <div className="bg-white mx-0 sm:mx-2 mt-4 rounded-[20px] shadow-sm border border-gray-100 p-4 mb-4">
        <h3 className="font-extrabold text-[14px] text-gray-900 mb-3">Bill Details</h3>
        <div className="flex justify-between items-center mb-2">
           <span className="text-[12px] font-medium text-gray-500">Item Total</span>
           <span className="text-[12px] font-bold text-gray-900">₹{subtotal()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
           <span className="text-[12px] font-medium text-gray-500">Delivery Fee</span>
           <span className="text-[12px] font-bold text-green-600">FREE</span>
        </div>
        <div className="border-t border-gray-100 my-3 pt-3 flex justify-between items-center">
           <span className="font-extrabold text-[14px] text-gray-900">To Pay</span>
           <span className="font-extrabold text-[16px] text-gray-900">₹{grand}</span>
        </div>
      </div>

      {/* Floating Bottom Bar (Slide to Pay style) */}
      <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-0 right-0 z-50 transition-transform pointer-events-none flex justify-center px-4">
        <div className="w-full max-w-[960px] bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.12)] px-4 pt-4 pb-6 pointer-events-auto relative">
        
        {/* Payment Selector Strip */}
        <div className="flex justify-between items-center mb-4 px-1 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-[10px] flex items-center justify-center text-gray-600">
              {paymentMethod === "phonepe" ? <Wallet size={18}/> : <IndianRupee size={18} className="text-green-700"/>}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pay Using</span>
              <span className="font-extrabold text-[13px] text-gray-900">{paymentMethod === "phonepe" ? "PhonePe (UPI)" : paymentMethod === "cod" ? "Cash on Delivery" : "Select Payment"}</span>
            </div>
          </div>
          
          <button onClick={() => setShowPaymentOptions(!showPaymentOptions)} className="font-bold text-[13px] text-orange-600 flex items-center gap-0.5 active:text-orange-700">
             Change <ChevronRight size={14} className="mt-0.5"/>
          </button>
        </div>

        {/* Inline Payment Options Drawer */}
        {showPaymentOptions && (
          <div className="absolute bottom-[90px] left-4 right-4 bg-white rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-[14px] text-gray-900 flex justify-between items-center">
              Select Payment Method
              <button onClick={() => setShowPaymentOptions(false)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><Plus size={14} className="rotate-45"/></button>
            </div>
            <button onClick={() => { setPaymentMethod("phonepe"); setShowPaymentOptions(false); }} className="w-full flex items-center justify-between p-4 border-b border-gray-50 text-left active:bg-gray-50">
               <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-[#6366F1]"/>
                  <span className="font-bold text-[14px] text-gray-900">PhonePe (UPI/Cards)</span>
               </div>
               {paymentMethod === "phonepe" && <Check size={18} className="text-orange-600"/>}
            </button>
            <button onClick={() => { setPaymentMethod("cod"); setShowPaymentOptions(false); }} className="w-full flex items-center justify-between p-4 text-left active:bg-gray-50">
               <div className="flex items-center gap-3">
                  <IndianRupee size={18} className="text-[#1B5E30]"/>
                  <span className="font-bold text-[14px] text-gray-900">Cash on Delivery</span>
               </div>
               {paymentMethod === "cod" && <Check size={18} className="text-orange-600"/>}
            </button>
          </div>
        )}

        {/* Slide to Pay Button */}
        <SlideToPayButton grand={grand} placing={placing} onSlideComplete={handlePlaceOrder} />
        </div>
      </div>
      
    </div>
  );
}
