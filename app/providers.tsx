"use client";

import { useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useOrderStore } from "@/store/orderStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { postAuthSync } from "@/lib/pwaAuthSync";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { setUser, setLoading: setUserLoading } = useUserStore();
  const { setActiveSubscription, setPlans, setSubscriptionDays, setLoading: setSubLoading } = useSubscriptionStore();
  const { setOrders, setActiveDelivery, setLoading: setOrderLoading } = useOrderStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const cancelledRef = useRef(false);

  const setAllLoading = useCallback((val: boolean) => {
    setUserLoading(val);
    setSubLoading(val);
    setOrderLoading(val);
  }, [setUserLoading, setSubLoading, setOrderLoading]);

  const setupRealtimeChannels = useCallback((userId: string, subscriptionId?: string) => {
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

    const channels = [notifChannel, ordersChannel, subChannel];

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
      channels.push(deliveryChannel);
    }

    channelsRef.current = channels;
  }, [addNotification]);

  useEffect(() => {
    cancelledRef.current = false;
    if (!isLoaded) return;
    if (!clerkUser) {
      setUser(null);
      setAllLoading(false);
      postAuthSync(null);
      return;
    }

    const bootstrap = async () => {
      try {
        const syncRes = await fetch("/api/users/sync");

        if (syncRes.status === 401) {
          setAllLoading(false);
          return;
        }

        if (!syncRes.ok) {
          setAllLoading(false);
          return;
        }

        const syncData = await syncRes.json();
        const supabaseUser = syncData.user;
        if (!supabaseUser || cancelledRef.current) {
          setAllLoading(false);
          return;
        }

        setUser(supabaseUser);
        setUserLoading(false);
        postAuthSync({ id: supabaseUser.id, email: supabaseUser.email, full_name: supabaseUser.full_name });

        const userId = supabaseUser.id;

        const [plansResult, subResult, notifsResult] = await Promise.all([
          supabase
            .from("subscription_plans")
            .select("*")
            .eq("is_active", true)
            .order("price", { ascending: true }),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .in("status", ["active", "paused"])
            .maybeSingle(),
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(30),
        ]);

        if (cancelledRef.current) return;

        if (plansResult.data) setPlans(plansResult.data);
        if (notifsResult.data) setNotifications(notifsResult.data);

        if (subResult.data) {
          setActiveSubscription(subResult.data);
          setSubLoading(false);

          const [daysResult, ordersResult] = await Promise.all([
            supabase
              .from("subscription_days")
              .select("*")
              .eq("subscription_id", subResult.data.id)
              .order("meal_date", { ascending: true }),
            supabase
              .from("food_orders")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

          if (cancelledRef.current) return;

          if (daysResult.data) setSubscriptionDays(daysResult.data);
          if (ordersResult.data) setOrders(ordersResult.data);
          setOrderLoading(false);

          const activeOrder = (ordersResult.data || []).find((o) =>
            ["preparing", "assigned", "out_for_delivery"].includes(o.status)
          );
          if (activeOrder) {
            const { data: delivery } = await supabase
              .from("delivery_assignments")
              .select("*")
              .eq("order_id", activeOrder.id)
              .maybeSingle();
            if (!cancelledRef.current && delivery) setActiveDelivery(delivery);
          }

          if (!cancelledRef.current) {
            setupRealtimeChannels(userId, subResult.data.id);
          }
        } else {
          const ordersResult = await supabase
            .from("food_orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!cancelledRef.current) {
            setSubLoading(false);
            if (ordersResult.data) setOrders(ordersResult.data);
            setOrderLoading(false);
            setupRealtimeChannels(userId);
          }
        }
      } catch {
        if (!cancelledRef.current) {
          setAllLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelledRef.current = true;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [isLoaded, clerkUser?.id]);

  return <ConfirmProvider>{children}</ConfirmProvider>;
}
