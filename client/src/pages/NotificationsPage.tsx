import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle,
  RefreshCw,
  CheckCheck,
  BellOff,
} from "lucide-react";
import type { Notification } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, EmptyState, Spinner } from "@/components/ui";
import NotificationItem from "@/components/notifications/NotificationItem";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "@/api/notificationApi";
import { extractErrorMessage } from "@/api/errors";

const POLL_INTERVAL = 30000;

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"read" | "delete" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      getNotifications()
        .then((data) => setNotifications(data.notifications))
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [token]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    setActionId(id);
    setActionType("read");
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      showToast(extractErrorMessage(err));
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    setActionType("delete");
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast("Notification deleted");
    } catch (err) {
      showToast(extractErrorMessage(err));
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    let failed = false;
    for (const n of unread) {
      try {
        await markAsRead(n._id);
      } catch {
        failed = true;
      }
    }
    if (failed) {
      showToast("Some notifications could not be marked as read");
      fetchNotifications();
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("All notifications marked as read");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && !loading && !error && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Couldn't load notifications"
            description={error}
            action={
              <Button onClick={fetchNotifications} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={<BellOff className="h-7 w-7" />}
            title="No notifications"
            description="You don't have any notifications yet."
          />
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                markingRead={
                  actionId === notification._id && actionType === "read"
                }
                deleting={
                  actionId === notification._id && actionType === "delete"
                }
              />
            ))}
          </div>
        </Card>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm shadow-card-hover">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
