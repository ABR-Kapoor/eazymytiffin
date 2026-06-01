"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bike, UserPlus, UserMinus, Phone } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

type DeliveryBoy = {
  id: string; full_name: string; phone: string; email: string; city: string;
  status: string; created_at: string;
  _deliveryCount?: number;
};

export default function AdminDeliveryBoysPage() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [promoteUserId, setPromoteUserId] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const { data: boyData } = await supabase.from("users").select("*").eq("role", "delivery_boy").order("created_at", { ascending: false });
    const { data: custData } = await supabase.from("users").select("id, full_name, phone").eq("role", "customer").eq("status", "active");
    setBoys((boyData as DeliveryBoy[]) || []);
    setCustomers(custData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePromote = async () => {
    if (!promoteUserId) return;
    const res = await fetch("/api/admin/users/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: promoteUserId, role: "delivery_boy" }) });
    const result = await res.json();
    if (result.success) { showToast("User promoted to Delivery Boy successfully!"); setPromoteUserId(""); fetchData(); }
    else showToast(result.error || "Failed", "error");
  };

  const handleDemote = async (userId: string) => {
    confirm({
      title: "Remove Role",
      message: "Remove delivery boy role? They'll become a customer.",
      confirmText: "Remove",
      onConfirm: async () => {
        const res = await fetch("/api/admin/users/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: "customer" }) });
        const result = await res.json();
        if (result.success) { showToast("Delivery Boy role removed successfully."); fetchData(); }
        else showToast(result.error || "Failed", "error");
      }
    });
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600 }}>{toast.msg}</div>}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
              <Bike size={20} />
            </div>
            Delivery Boys
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">{boys.length} active delivery personnel</p>
        </div>
      </div>

      {/* Promote customer to delivery boy */}
      <div className="bg-white rounded-2xl p-5 border border-[rgba(212,184,150,0.2)] shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-end animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex-1 w-full">
          <label className="text-[11px] font-bold text-[#9CA3AF] flex items-center gap-1.5 mb-2 uppercase tracking-wide">
            <UserPlus size={14} className="text-[#0EA5E9]" /> Promote customer to Delivery Boy
          </label>
          <div className="w-full">
            <CustomSelect 
              value={promoteUserId} 
              onChange={(val) => setPromoteUserId(val)}
              options={[
                { value: "", label: "— Select a customer —" },
                ...customers.map(c => ({ value: c.id, label: `${c.full_name} (${c.phone})` }))
              ]}
            />
          </div>
        </div>
        <button onClick={handlePromote} disabled={!promoteUserId}
          className={`btn-glare flex items-center justify-center gap-2 rounded-xl px-5 py-[10px] h-[42px] text-[13px] font-bold shadow-lg transition-all w-full sm:w-auto whitespace-nowrap ${!promoteUserId ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-[#0EA5E9]/30 hover:shadow-[#0EA5E9]/50 hover:-translate-y-0.5"}`}>
          Assign Role
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] animate-spin mx-auto mb-4" />
          <p className="text-[#9CA3AF] font-medium">Loading delivery team…</p>
        </div>
      ) : boys.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[rgba(212,184,150,0.15)] shadow-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Bike size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-extrabold text-[18px] text-[#1A1A1A] m-0 mb-1">No delivery boys yet</p>
          <p className="text-[#9CA3AF] text-[13px] m-0">Promote a customer using the panel above to build your team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {boys.map((b, index) => {
            const CARD_COLORS = ["#1B5E30", "#E8392A", "#D35400", "#6366F1", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981"];
            const color = CARD_COLORS[index % CARD_COLORS.length];
            return (
            <div key={b.id} 
              className="rounded-[24px] p-6 border flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
              style={{ 
                background: `linear-gradient(135deg, ${color}12, ${color}03)`, 
                border: `1px solid ${color}25` 
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none rounded-bl-full" />
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-white font-extrabold text-[18px] flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)`, boxShadow: `0 4px 12px ${color}30` }}>
                  {b.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#1A1A1A] m-0 leading-tight">{b.full_name}</p>
                  <p className="text-[13px] font-medium text-[#6B7280] m-0 mt-0.5">{b.phone}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4 relative z-10">
                <span className="flex items-center text-[10px] font-extrabold bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-full px-2.5 py-0.5 tracking-wider uppercase border border-[#0EA5E9]/20">
                  <Bike size={12} className="mr-1 -mt-[1px]" /> Delivery Boy
                </span>
                <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 tracking-wider uppercase border ${b.status === "active" ? "bg-[#1B5E30]/10 text-[#1B5E30] border-[#1B5E30]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"}`}>
                  {b.status}
                </span>
              </div>

              <div className="mt-auto relative z-10">
                <p className="text-[11px] font-semibold text-[#9CA3AF] mb-4">
                  {b.city} <span className="mx-1">•</span> Joined {new Date(b.created_at).toLocaleDateString("en-IN")}
                </p>
                
                <div className="flex gap-2">
                  <a href={`tel:${b.phone}`} className="flex-1 py-2.5 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white border-none font-bold text-[13px] text-center no-underline transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Phone size={14} /> Call
                  </a>
                  <button onClick={() => handleDemote(b.id)}
                    className="py-2.5 px-3 rounded-xl bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border-none font-bold text-[13px] cursor-pointer transition-colors shadow-sm flex items-center justify-center">
                    <UserMinus size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
