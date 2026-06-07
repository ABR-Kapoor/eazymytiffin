"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";

export function ActiveOrderAlert() {
  const { getActiveOrder, activeDelivery } = useOrderStore();
  const activeOrder = getActiveOrder();
  
  const [etaText, setEtaText] = useState("Order processing...");

  useEffect(() => {
    if (!activeOrder) return;

    if (!activeDelivery?.eta || !activeDelivery?.updated_at) {
      if (activeOrder.status === "preparing") setEtaText("Preparing order...");
      else if (activeOrder.status === "assigned") setEtaText("Order assigned to delivery boy");
      else setEtaText("Order on the way");
      return;
    }

    if (activeDelivery.eta === "Delayed") {
      setEtaText("Order is delayed");
      return;
    }

    const match = activeDelivery.eta.match(/(\d+)/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const updatedAt = new Date(activeDelivery.updated_at).getTime();
      const targetTime = updatedAt + mins * 60 * 1000;

      const updateRemaining = () => {
        const diff = targetTime - Date.now();
        if (diff <= 0) {
          setEtaText("Arriving momentarily");
        } else {
          const remMins = Math.ceil(diff / 60000);
          setEtaText(`Arriving in ${remMins} min${remMins !== 1 ? "s" : ""}`);
        }
      };

      updateRemaining();
      const interval = setInterval(updateRemaining, 30000);
      return () => clearInterval(interval);
    } else {
      setEtaText("Order Arriving soon");
    }
  }, [activeOrder, activeDelivery]);

  if (!activeOrder) return null;

  return (
    <div className="bg-white border border-[#1BA672]/20 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative overflow-hidden flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
        <Truck size={24} className="text-[#1BA672] animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[15px] text-[#1C1C1C] m-0">
          {etaText}
        </p>
        <p className="text-[13px] text-[#1BA672] font-bold m-0 mt-0.5 capitalize">
          {activeOrder.status.replace(/_/g, " ")} • Track Order
        </p>
      </div>
      <Link href="/orders" className="absolute inset-0 z-10" />
    </div>
  );
}
