"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useOrderStore } from "@/store/orderStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ConfirmProvider } from "@/components/ConfirmProvider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { setUser, setLoading: setUserLoading } = useUserStore();
  const { setActiveSubscription, setPlans, setSubscriptionDays, setLoading: setSubLoading } = useSubscriptionStore();
  const { setOrders, setActiveDelivery, setLoading: setOrderLoading } = useOrderStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        // 1. Sync user to Supabase
        const syncRes = await fetch("/api/users/sync");
        const syncData = await syncRes.json();
        const supabaseUser = syncData.user;
        if (!supabaseUser || cancelled) return;

        setUser(supabaseUser);
        setUserLoading(false);

        const userId = supabaseUser.id;

        // 2. Fetch subscription plans
        const { data: plans } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });
        if (!cancelled) setPlans(plans || []);

        // 3. Fetch active subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .in("status", ["active", "paused"])
          .maybeSingle();
        if (!cancelled) {
          setActiveSubscription(sub);
          setSubLoading(false);
        }

        // 4. Fetch subscription days (meal calendar)
        if (sub) {
          const { data: days } = await supabase
            .from("subscription_days")
            .select("*")
            .eq("subscription_id", sub.id)
            .order("meal_date", { ascending: true });
          if (!cancelled) setSubscriptionDays(days || []);
        }

        // 5. Fetch food orders (latest 20)
        const { data: orders } = await supabase
          .from("food_orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);
        if (!cancelled) {
          setOrders(orders || []);
          setOrderLoading(false);
        }

        // 6. Fetch active delivery assignment
        const activeOrder = (orders || []).find((o) =>
          ["preparing", "assigned", "out_for_delivery"].includes(o.status)
        );
        if (activeOrder) {
          const { data: delivery } = await supabase
            .from("delivery_assignments")
            .select("*")
            .eq("order_id", activeOrder.id)
            .maybeSingle();
          if (!cancelled && delivery) setActiveDelivery(delivery);
        }

        // 7. Fetch notifications
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(30);
        if (!cancelled) setNotifications(notifs || []);

        // 8. Attach Supabase Realtime channels
        if (!cancelled) {
          setupRealtimeChannels(userId, sub?.id);
        }
      } catch (err) {
        console.error("[AppProvider] bootstrap error:", err);
        setUserLoading(false);
        setSubLoading(false);
        setOrderLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, clerkUser?.id]);

  const setupRealtimeChannels = (userId: string, subscriptionId?: string) => {
    const notifChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => { addNotification(payload.new as any); }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel(`food_orders:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_orders", filter: `user_id=eq.${userId}` },
        (payload) => {
          const { upsertOrder } = useOrderStore.getState();
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            upsertOrder(payload.new as any);
          }
        }
      )
      .subscribe();

    const subChannel = supabase
      .channel(`subscriptions:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
        (payload) => {
          const { setActiveSubscription } = useSubscriptionStore.getState();
          setActiveSubscription(payload.new as any);
        }
      )
      .subscribe();

    channelsRef.current = [notifChannel, ordersChannel, subChannel];

    if (subscriptionId) {
      const deliveryChannel = supabase
        .channel(`delivery:${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "delivery_assignments" },
          (payload) => {
            const { setActiveDelivery } = useOrderStore.getState();
            if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
              setActiveDelivery(payload.new as any);
            }
          }
        )
        .subscribe();
      channelsRef.current.push(deliveryChannel);
    }
  };

  return <ConfirmProvider>{children}</ConfirmProvider>;
}
