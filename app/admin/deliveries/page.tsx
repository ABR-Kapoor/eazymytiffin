"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Truck, Bike, Sun, Moon, Clock, Camera, MapPin, List, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

type Assignment = {
  id: string; order_id: string; delivery_boy_id: string; status: string; eta: string | null; proof_image: string | null; created_at: string;
  delivery_boy: { full_name: string; phone: string } | null;
  order: { total_amount: number; time_slot: string; user: { full_name: string; phone: string } | null; address: { area: string; city: string; google_map_link: string | null } | null } | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  assigned: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9" },
  on_the_way: { bg: "rgba(232,57,42,0.1)", text: "#E8392A" },
  arriving: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
  delivered: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
  failed: { bg: "rgba(156,163,175,0.1)", text: "#6B7280" },
};

export default function AdminDeliveriesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const channelRef = useRef<any>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const q = supabase
      .from("delivery_assignments")
      .select(`id, order_id, delivery_boy_id, status, eta, proof_image, created_at,
        delivery_boy:users!delivery_assignments_delivery_boy_id_fkey(full_name, phone),
        order:food_orders(total_amount, time_slot,
          user:users!food_orders_user_id_fkey(full_name, phone),
          address:addresses(area, city, google_map_link)
        )`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter === "active") {
      q.not("status", "in", '("delivered","failed")');
    }

    const { data } = await q;
    setAssignments((data as any) || []);

    const { data: boys } = await supabase.from("users").select("id, full_name").eq("role", "delivery_boy").eq("status", "active");
    setDeliveryBoys(boys || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    channelRef.current = supabase.channel("admin:deliveries")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, fetchData)
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [statusFilter]);

  const handleAssign = async (orderId: string, deliveryBoyId: string) => {
    const { error } = await supabase.from("delivery_assignments").upsert([{
      order_id: orderId, delivery_boy_id: deliveryBoyId, status: "assigned",
    }], { onConflict: "order_id" });
    await supabase.from("food_orders").update({ status: "assigned", assigned_delivery_boy: deliveryBoyId }).eq("id", orderId);
    if (!error) showToast("Delivery boy assigned!");
    else showToast("Assignment failed", "error");
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => !["delivered", "failed"].includes(a.status)).length,
    delivered: assignments.filter((a) => a.status === "delivered").length,
    delayed: assignments.filter((a) => a.eta === "Delayed").length,
  };

  return (
    <div>
      {toast && <div className={`fixed top-5 right-5 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-bold shadow-lg animate-fade-up ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`}>{toast.msg}</div>}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
              <Truck size={20} />
            </div>
            Delivery Management
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">Monitor and assign active deliveries</p>
        </div>
        <button onClick={fetchData} className="btn-glare flex items-center justify-center gap-2 bg-white border border-[rgba(212,184,150,0.3)] hover:border-[#E8392A] hover:text-[#E8392A] text-[#4A3A2A] rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-all h-fit w-fit">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "Total", value: stats.total, color: "#6366F1", icon: <List size={22} /> },
          { label: "Active", value: stats.active, color: "#0EA5E9", icon: <Activity size={22} /> },
          { label: "Delivered", value: stats.delivered, color: "#1B5E30", icon: <CheckCircle size={22} /> },
          { label: "Delayed", value: stats.delayed, color: "#E8392A", icon: <AlertCircle size={22} /> },
        ].map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
            <div 
              className="card-lift rounded-[24px] p-6 shadow-sm relative overflow-hidden group h-full text-left"
              style={{ background: `linear-gradient(135deg, ${s.color}12, ${s.color}03)`, border: `1px solid ${s.color}25` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none rounded-bl-full" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-[16px] flex items-center justify-center relative transition-transform group-hover:scale-110 duration-300 ease-out" style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p className="font-bold text-3xl text-[#121212] mb-1 tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider m-0">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {["active", "all"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)} 
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer capitalize border transition-all ${statusFilter === f ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md" : "bg-white text-[#6B7280] border-[rgba(212,184,150,0.3)] hover:bg-gray-50"}`}>
            {f === "active" ? "Active Only" : "All Today"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#E8392A]/20 border-t-[#E8392A] animate-spin mx-auto mb-4" />
          <p className="text-[#9CA3AF] font-medium">Loading deliveries…</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[rgba(212,184,150,0.15)] shadow-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Truck size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-extrabold text-[18px] text-[#1A1A1A] m-0 mb-1">No deliveries found</p>
          <p className="text-[#9CA3AF] text-[13px] m-0">No active deliveries match your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {assignments.map((a, index) => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.failed;
            const CARD_COLORS = ["#1B5E30", "#E8392A", "#D35400", "#6366F1", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981"];
            const color = CARD_COLORS[index % CARD_COLORS.length];
            return (
              <div key={a.id} 
                className="rounded-[24px] p-5 border flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                style={{ 
                  background: `linear-gradient(135deg, ${color}10, ${color}02)`, 
                  border: `1px solid ${color}25` 
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none rounded-bl-full" />
                
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-black/5 relative z-10">
                  <div>
                    <p className="font-extrabold text-[14px] text-[#1A1A1A] m-0 flex items-center gap-1.5">
                      <Bike size={14} className="text-[#0EA5E9]" /> {a.delivery_boy?.full_name || "Unassigned"}
                    </p>
                    <p className="text-[11px] font-medium text-[#6B7280] m-0 mt-0.5 ml-5">{a.delivery_boy?.phone || "—"}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm" style={{ background: sc.bg, color: sc.text, borderColor: sc.bg }}>
                    {a.status.replace(/_/g, " ")}
                  </span>
                </div>
                
                <div className="flex-1 relative z-10">
                  <p className="font-extrabold text-[15px] text-[#1A1A1A] m-0 mb-1 leading-tight">{a.order?.user?.full_name || "—"}</p>
                  <p className="text-[12px] font-medium text-[#6B7280] m-0 mb-4 leading-relaxed line-clamp-2">
                    {a.order?.address?.area}, {a.order?.address?.city}
                    {a.order?.address?.google_map_link && (
                      <a href={a.order.address.google_map_link} target="_blank" rel="noreferrer" className="ml-2 text-[#0EA5E9] font-bold no-underline inline-flex items-center gap-0.5 hover:underline">
                        <MapPin size={12} /> Map
                      </a>
                    )}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <span className="text-[11px] font-extrabold bg-white shadow-sm border border-black/5 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[#1A1A1A]">
                      {a.order?.time_slot === "lunch" ? <Sun size={12} className="text-[#F59E0B]" /> : <Moon size={12} className="text-[#6366F1]" />} 
                      {a.order?.time_slot === "lunch" ? "Lunch" : "Dinner"} · ₹{a.order?.total_amount}
                    </span>
                    {a.eta && (
                      <span className={`text-[11px] font-extrabold rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm border ${a.eta === "Delayed" ? "bg-[#E8392A]/10 text-[#E8392A] border-[#E8392A]/20" : "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20"}`}>
                        <Clock size={12} /> {a.eta}
                      </span>
                    )}
                    {a.proof_image && (
                      <a href={a.proof_image} target="_blank" rel="noreferrer" className="text-[11px] font-extrabold bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 rounded-full px-2.5 py-1 flex items-center gap-1 no-underline shadow-sm hover:bg-[#0EA5E9] hover:text-white transition-colors">
                        <Camera size={12} /> Proof
                      </a>
                    )}
                  </div>

                  {/* Reassign */}
                  {a.status !== "delivered" && (
                    <div className="mt-auto pt-2">
                      <CustomSelect 
                        value={a.delivery_boy_id || ""} 
                        onChange={(val) => handleAssign(a.order_id, val)}
                        options={[
                          { value: "", label: "— Reassign Driver —" },
                          ...deliveryBoys.map(b => ({ value: b.id, label: b.full_name }))
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
