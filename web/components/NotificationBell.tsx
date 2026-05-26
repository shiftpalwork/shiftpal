"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile } from "@/lib/auth";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const supabase = createBrowserSupabaseClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function loadNotifications() {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    setUserId(profile.id);

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Notification loading error:", error);
      return;
    }

    setNotifications((data ?? []) as Notification[]);
  }

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notification-bell-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function markAllRead() {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Notification update error:", error);
      return;
    }

    await loadNotifications();
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-xl border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-black">Notifications</h3>

            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-gray-500 hover:text-black"
            >
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-3 ${
                    notification.is_read ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-black">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}