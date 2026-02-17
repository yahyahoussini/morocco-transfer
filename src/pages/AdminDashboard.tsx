import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Shield, Bell, X, Check, Clock, Phone, MapPin, Car, Download, HelpCircle, Smartphone, Route, Plus, Trash2, BarChart3, TrendingUp, DollarSign, CalendarIcon, Settings, Save, ChevronRight, Pencil, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { RouteRow } from "@/lib/pricing";
import { NotificationSettings } from "@/components/NotificationSettings";
import { registerServiceWorker } from "@/lib/registerServiceWorker";
import { subscribeToPushNotifications } from "@/lib/pushNotifications";

const ADMIN_PIN = "1234";
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface Booking {
  id: string;
  created_at: string;
  passenger_name: string;
  phone: string;
  email: string | null;
  pickup: string;
  dropoff: string | null;
  vehicle: string;
  trip_type: string;
  hours: number | null;
  price: number;
  status: string;
  room_or_passengers: string | null;
  pickup_time?: string | null;
  comment?: string | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const statusColors: Record<string, string> = {
  Pending: "bg-destructive/20 text-destructive border-destructive/30",
  Confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

function SwipeableBookingCard({ booking, onConfirm, onCancel, onTap }: {
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
  onTap: () => void;
}) {
<<<<<<< HEAD
  const { t } = useI18n();
=======
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [0, 100], ["rgba(16,185,129,0)", "rgba(16,185,129,0.2)"]);
  const bgRight = useTransform(x, [-100, 0], ["rgba(239,68,68,0.2)", "rgba(239,68,68,0)"]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) onConfirm();
    else if (info.offset.x < -100) onCancel();
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div className="absolute inset-0 rounded-xl flex items-center justify-between px-6" style={{ background: bgLeft }}>
        <Check className="w-6 h-6 text-emerald-400" />
        <span />
      </motion.div>
      <motion.div className="absolute inset-0 rounded-xl flex items-center justify-between px-6" style={{ background: bgRight }}>
        <span />
        <X className="w-6 h-6 text-destructive" />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={onTap}
        className="relative glass rounded-xl p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-foreground">{booking.passenger_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <Badge className={`${statusColors[booking.status]} border text-xs`}>{booking.status}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{booking.pickup}{booking.dropoff ? ` → ${booking.dropoff}` : ''}</span>
        </div>
        {booking.comment && (
          <div className="mt-2 p-2 bg-secondary/30 rounded-lg text-xs italic text-muted-foreground flex gap-2">
            <span className="font-semibold not-italic">Note:</span>
            "{booking.comment}"
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="w-3 h-3" />
<<<<<<< HEAD
            <span>
              {booking.vehicle === 'Vito' ? t('mercedesVito') :
                booking.vehicle === 'Dacia' ? t('daciaLodgy') :
                  booking.vehicle === 'Octavia' ? t('skodaOctavia') :
                    booking.vehicle === 'Karoq' ? t('skodaKaroq') : booking.vehicle}
            </span>
          </div>
          <span className="text-gold font-serif font-bold">{Number(booking.price).toLocaleString()} DH</span>
        </div>
      </motion.div >
    </div >
=======
            <span>{booking.vehicle === 'Vito' ? 'Mercedes vito de luxe' : 'Dacia Lodgy'}</span>
          </div>
          <span className="text-gold font-serif font-bold">{Number(booking.price).toLocaleString()} DH</span>
        </div>
      </motion.div>
    </div>
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
  );
}

const AdminDashboard = () => {
  const { t } = useI18n();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [alertBooking, setAlertBooking] = useState<Booking | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'routes' | 'analytics' | 'settings'>('bookings');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Settings state
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Routes state
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
<<<<<<< HEAD
  const [editRoute, setEditRoute] = useState({
    pickup: '', dropoff: '',
    vito_one_way: '', dacia_one_way: '', octavia_one_way: '', karoq_one_way: '',
    vito_round_trip: '', dacia_round_trip: '', octavia_round_trip: '', karoq_round_trip: ''
  });
  const [newRoute, setNewRoute] = useState({
    pickup: '', dropoff: '',
    vito_one_way: '', dacia_one_way: '', octavia_one_way: '', karoq_one_way: '',
    vito_round_trip: '', dacia_round_trip: '', octavia_round_trip: '', karoq_round_trip: '',
=======
  const [editRoute, setEditRoute] = useState({ pickup: '', dropoff: '', vito_one_way: '', dacia_one_way: '', vito_round_trip: '', dacia_round_trip: '' });
  const [newRoute, setNewRoute] = useState({
    pickup: '', dropoff: '',
    vito_one_way: '', dacia_one_way: '',
    vito_round_trip: '', dacia_round_trip: '',
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
  });

  // Analytics date range
  const [analyticsFrom, setAnalyticsFrom] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d;
  });
  const [analyticsTo, setAnalyticsTo] = useState<Date>(() => {
    const d = new Date(); d.setHours(23, 59, 59, 999); return d;
  });

  // Analytics computations
  const analytics = useMemo(() => {
    const fromStart = new Date(analyticsFrom); fromStart.setHours(0, 0, 0, 0);
    const toEnd = new Date(analyticsTo); toEnd.setHours(23, 59, 59, 999);

    const inRange = bookings.filter((b) => {
      const d = new Date(b.created_at);
      return d >= fromStart && d <= toEnd;
    });
    const confirmed = inRange.filter((b) => b.status !== 'Cancelled');
    const totalRevenue = confirmed.reduce((sum, b) => sum + Number(b.price), 0);
    const pendingRevenue = inRange.filter((b) => b.status === 'Pending').reduce((sum, b) => sum + Number(b.price), 0);
    const confirmedRevenue = inRange.filter((b) => b.status === 'Confirmed').reduce((sum, b) => sum + Number(b.price), 0);

    const routeMap = new Map<string, { count: number; revenue: number }>();
    confirmed.forEach((b) => {
      const key = b.dropoff ? `${b.pickup} → ${b.dropoff}` : `${b.pickup} (Hourly)`;
      const existing = routeMap.get(key) || { count: 0, revenue: 0 };
      routeMap.set(key, { count: existing.count + 1, revenue: existing.revenue + Number(b.price) });
    });
    const topRoutes = Array.from(routeMap.entries())
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.count - a.count);

    // Daily revenue for range
    const dailyRevenue: { date: string; revenue: number; count: number }[] = [];
    const dayCount = Math.max(1, Math.ceil((toEnd.getTime() - fromStart.getTime()) / (1000 * 60 * 60 * 24)));
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(fromStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const dayBookings = confirmed.filter((b) => {
        const bd = new Date(b.created_at);
        return bd.toDateString() === d.toDateString();
      });
      dailyRevenue.push({
        date: dateStr,
        revenue: dayBookings.reduce((s, b) => s + Number(b.price), 0),
        count: dayBookings.length,
      });
    }

    return { totalRevenue, pendingRevenue, confirmedRevenue, topRoutes, dailyRevenue, totalBookings: confirmed.length };
  }, [bookings, analyticsFrom, analyticsTo]);

  useEffect(() => {
    // Check persistent auth
    const storedAuth = localStorage.getItem("admin_authenticated");
    if (storedAuth === "true") {
      setAuthenticated(true);
    }

    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 1.0;
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Register service worker for push notifications and PWA
    registerServiceWorker().catch((err) => console.error("SW registration failed:", err));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPromptRef.current) {
      await deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === "accepted") {
        toast.success("App installed! 🎉");
        setCanInstall(false);
      }
      deferredPromptRef.current = null;
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    setPin("");
    toast.success("Logged out");
  };

  const playAlertSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const sendSystemNotification = useCallback(async (booking: Booking) => {
    if ("Notification" in window && Notification.permission === "granted") {
<<<<<<< HEAD
      const vehicleName = booking.vehicle === 'Vito' ? t('mercedesVito') :
        booking.vehicle === 'Dacia' ? t('daciaLodgy') :
          booking.vehicle === 'Octavia' ? t('skodaOctavia') :
            booking.vehicle === 'Karoq' ? t('skodaKaroq') : booking.vehicle;
=======
      const vehicleName = booking.vehicle === 'Vito' ? 'Mercedes vito de luxe' : 'Dacia Lodgy';
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
      const route = booking.dropoff ? `${booking.pickup} → ${booking.dropoff}` : `${booking.pickup} (Hourly)`;
      const body = `👤 ${booking.passenger_name}\n💰 ${Number(booking.price).toLocaleString()} DH\n🚗 ${vehicleName}\n📍 ${route}`;

      // Use Service Worker notification for background support on installed PWA
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("🛒 New Order Received!", {
            body,
            tag: `booking-${booking.id}`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            silent: false,
            vibrate: [200, 100, 200, 100, 200],
            data: { url: "/admin/morocco-cmd" },
            actions: [
              { action: "view", title: "👁️ View" },
              { action: "confirm", title: "✅ Confirm" },
            ],
          } as NotificationOptions);
          return;
        } catch { }
      }

      // Fallback to basic notification
      const notification = new Notification("🛒 New Order Received!", {
        body,
        tag: `booking-${booking.id}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true,
      });
      notification.onclick = () => { window.focus(); notification.close(); };
    }
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported on this browser");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast.success("Notifications enabled!");
      new Notification("🔔 Notifications Active", {
        body: "You'll receive instant alerts for every new booking — just like your favorite shopping app!",
        icon: "/icon-192.png",
      });
    } else {
      toast.error("Permission denied. Please enable notifications in your browser settings.");
    }
  };

  // Fetch bookings & routes
  useEffect(() => {
    if (!authenticated) return;
    const fetchData = async () => {
      const [bookingsRes, routesRes, settingsRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("routes").select("*").order("pickup", { ascending: true }),
        supabase.from("settings").select("*").eq("key", "whatsapp_number").maybeSingle(),
      ]);
      if (bookingsRes.data) {
        console.log("Bookings data:", bookingsRes.data); // Debug: Check if room_or_passengers is present
        setBookings(bookingsRes.data as Booking[]);
      }
      if (routesRes.data) setRoutes(routesRes.data as RouteRow[]);
      if (settingsRes.data) setWhatsappNumber((settingsRes.data as any).value);
    };
    fetchData();

    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        const newBooking = payload.new as Booking;
        setBookings((prev) => [newBooking, ...prev]);
        playAlertSound();
        sendSystemNotification(newBooking);
        setAlertBooking(newBooking);

        // Push notification to ALL subscribed devices (phones, other browsers)
        supabase.functions.invoke('send-push-notification', {
          body: { booking: newBooking }
        }).catch(err => console.error('Push to other devices failed:', err));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, (payload) => {
        const updated = payload.new as Booking;
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "bookings" }, (payload) => {
        const deleted = payload.old as Booking;
        setBookings((prev) => prev.filter((b) => b.id !== deleted.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authenticated, playAlertSound, sendSystemNotification]);

  const handlePinComplete = async (value: string) => {
    setPin(value);
    if (value === ADMIN_PIN) {
      setAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");

      // Auto-subscribe to push notifications on first login
      try {
        const sub = await subscribeToPushNotifications('admin-device');
        if (sub) {
          toast.success("Notifications enabled automatically!");
        }
      } catch (err) {
        console.error("Auto-subscribe failed:", err);
        // Non-blocking: user can still enable manually from Settings
      }
    } else {
      toast.error("Invalid PIN");
      setPin("");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Booking ${status.toLowerCase()}`);
  };

  const deleteBooking = async (id: string) => {
    await supabase.from("bookings").delete().eq("id", id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelectedBooking(null);
    setDeleteTarget(null);
    toast.success(t("bookingDeleted"));
  };

  const addRoute = async () => {
    if (!newRoute.pickup.trim() || !newRoute.dropoff.trim() || !newRoute.vito_one_way || !newRoute.dacia_one_way) {
<<<<<<< HEAD
      toast.error("Fill in pickup, dropoff, and at least Vito/Dacia prices");
=======
      toast.error("Fill in pickup, dropoff, and one-way prices");
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
      return;
    }
    const payload = {
      pickup: newRoute.pickup.trim(),
      dropoff: newRoute.dropoff.trim(),
      vito_one_way: Number(newRoute.vito_one_way),
      dacia_one_way: Number(newRoute.dacia_one_way),
<<<<<<< HEAD
      octavia_one_way: Number(newRoute.octavia_one_way || 0),
      karoq_one_way: Number(newRoute.karoq_one_way || 0),
      vito_round_trip: newRoute.vito_round_trip ? Number(newRoute.vito_round_trip) : null,
      dacia_round_trip: newRoute.dacia_round_trip ? Number(newRoute.dacia_round_trip) : null,
      octavia_round_trip: newRoute.octavia_round_trip ? Number(newRoute.octavia_round_trip) : null,
      karoq_round_trip: newRoute.karoq_round_trip ? Number(newRoute.karoq_round_trip) : null,
=======
      vito_round_trip: newRoute.vito_round_trip ? Number(newRoute.vito_round_trip) : null,
      dacia_round_trip: newRoute.dacia_round_trip ? Number(newRoute.dacia_round_trip) : null,
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
    };
    const { data, error } = await supabase.from("routes").insert(payload as any).select().maybeSingle();
    if (error) {
      toast.error(error.message.includes("duplicate") ? "This route already exists" : "Failed to add route");
      return;
    }
    if (data) setRoutes((prev) => [...prev, data as RouteRow]);
<<<<<<< HEAD
    setNewRoute({
      pickup: '', dropoff: '',
      vito_one_way: '', dacia_one_way: '', octavia_one_way: '', karoq_one_way: '',
      vito_round_trip: '', dacia_round_trip: '', octavia_round_trip: '', karoq_round_trip: ''
    });
=======
    setNewRoute({ pickup: '', dropoff: '', vito_one_way: '', dacia_one_way: '', vito_round_trip: '', dacia_round_trip: '' });
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
    setShowAddRoute(false);
    toast.success("Route added!");
  };

  const deleteRoute = async (id: string) => {
    await supabase.from("routes").delete().eq("id", id);
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    toast.success("Route deleted");
  };

  const startEditRoute = (route: RouteRow) => {
    setEditingRouteId(route.id);
    setEditRoute({
      pickup: route.pickup,
      dropoff: route.dropoff,
      vito_one_way: String(route.vito_one_way),
      dacia_one_way: String(route.dacia_one_way),
<<<<<<< HEAD
      octavia_one_way: String(route.octavia_one_way || 0),
      karoq_one_way: String(route.karoq_one_way || 0),
      vito_round_trip: route.vito_round_trip ? String(route.vito_round_trip) : '',
      dacia_round_trip: route.dacia_round_trip ? String(route.dacia_round_trip) : '',
      octavia_round_trip: route.octavia_round_trip ? String(route.octavia_round_trip) : '',
      karoq_round_trip: route.karoq_round_trip ? String(route.karoq_round_trip) : '',
=======
      vito_round_trip: route.vito_round_trip ? String(route.vito_round_trip) : '',
      dacia_round_trip: route.dacia_round_trip ? String(route.dacia_round_trip) : '',
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
    });
  };

  const saveEditRoute = async () => {
    if (!editingRouteId || !editRoute.pickup.trim() || !editRoute.dropoff.trim() || !editRoute.vito_one_way || !editRoute.dacia_one_way) {
      toast.error("Pickup, dropoff and one-way prices are required");
      return;
    }
    const payload = {
      pickup: editRoute.pickup.trim(),
      dropoff: editRoute.dropoff.trim(),
      vito_one_way: Number(editRoute.vito_one_way),
      dacia_one_way: Number(editRoute.dacia_one_way),
<<<<<<< HEAD
      octavia_one_way: Number(editRoute.octavia_one_way),
      karoq_one_way: Number(editRoute.karoq_one_way),
      vito_round_trip: editRoute.vito_round_trip ? Number(editRoute.vito_round_trip) : null,
      dacia_round_trip: editRoute.dacia_round_trip ? Number(editRoute.dacia_round_trip) : null,
      octavia_round_trip: editRoute.octavia_round_trip ? Number(editRoute.octavia_round_trip) : null,
      karoq_round_trip: editRoute.karoq_round_trip ? Number(editRoute.karoq_round_trip) : null,
=======
      vito_round_trip: editRoute.vito_round_trip ? Number(editRoute.vito_round_trip) : null,
      dacia_round_trip: editRoute.dacia_round_trip ? Number(editRoute.dacia_round_trip) : null,
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
    };
    const { error } = await supabase.from("routes").update(payload as any).eq("id", editingRouteId);
    if (error) { toast.error("Failed to update route"); return; }
    setRoutes((prev) => prev.map((r) => r.id === editingRouteId ? { ...r, ...payload } : r));
    setEditingRouteId(null);
    toast.success("Route updated!");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">{t("adminAccess")}</h1>
          <p className="text-muted-foreground text-sm mb-6">{t("enterPin")}</p>
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={pin} onChange={setPin} onComplete={handlePinComplete}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-border bg-secondary/50 text-foreground" />
                <InputOTPSlot index={1} className="border-border bg-secondary/50 text-foreground" />
                <InputOTPSlot index={2} className="border-border bg-secondary/50 text-foreground" />
                <InputOTPSlot index={3} className="border-border bg-secondary/50 text-foreground" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pt-14 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">{t("commandCenter")}</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleInstallApp} className={`transition-colors ${canInstall ? 'text-gold animate-pulse' : 'text-muted-foreground hover:text-foreground'}`} title="Install App">
            <Download className="w-5 h-5" />
          </button>
          <Bell className="w-5 h-5 text-gold" />
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Install Banner */}
      {canInstall && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <button
            onClick={handleInstallApp}
            className="w-full glass rounded-xl p-3 flex items-center gap-3 border border-gold/30 hover:border-gold/60 transition-all"
          >
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-foreground">Install Admin App</p>
              <p className="text-xs text-muted-foreground">Get instant notifications on your phone</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* Tab Switcher */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {([
          { id: 'bookings' as const, icon: Bell, label: t("bookings") },
          { id: 'routes' as const, icon: Route, label: t("routes") },
          { id: 'analytics' as const, icon: BarChart3, label: t("analytics") },
          { id: 'settings' as const, icon: Settings, label: "⚙️" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${activeTab === tab.id
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <>
          {/* Notification Enable Button */}
          {!notificationsEnabled && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <button
                onClick={enableNotifications}
                className="w-full glass rounded-xl p-4 flex items-center gap-3 border border-gold/30 hover:border-gold/60 transition-all"
              >
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">🔔 Enable Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Get instant alerts for every new booking — like your favorite shopping app</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {bookings.map((b) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} layout>
                  <SwipeableBookingCard
                    booking={b}
                    onConfirm={() => updateStatus(b.id, "Confirmed")}
                    onCancel={() => updateStatus(b.id, "Cancelled")}
                    onTap={() => setSelectedBooking(b)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {bookings.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No bookings yet</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'routes' && (
        <div className="space-y-3">
          <Button onClick={() => setShowAddRoute(true)} className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add New Route
          </Button>

          {routes.map((route) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  {route.pickup} → {route.dropoff}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editingRouteId === route.id ? setEditingRouteId(null) : startEditRoute(route)} className="text-muted-foreground hover:text-gold transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteRoute(route.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingRouteId === route.id ? (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Pickup Location</Label>
                      <Input value={editRoute.pickup} onChange={(e) => setEditRoute(p => ({ ...p, pickup: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Dropoff Location</Label>
                      <Input value={editRoute.dropoff} onChange={(e) => setEditRoute(p => ({ ...p, dropoff: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
<<<<<<< HEAD
                      <Label className="text-[10px] text-muted-foreground">Vito 1-Way</Label>
                      <Input value={editRoute.vito_one_way} onChange={(e) => setEditRoute(p => ({ ...p, vito_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Vito R-Trip</Label>
                      <Input value={editRoute.vito_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, vito_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Lodgy 1-Way</Label>
                      <Input value={editRoute.dacia_one_way} onChange={(e) => setEditRoute(p => ({ ...p, dacia_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Lodgy R-Trip</Label>
                      <Input value={editRoute.dacia_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, dacia_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Octavia 1-Way</Label>
                      <Input value={editRoute.octavia_one_way} onChange={(e) => setEditRoute(p => ({ ...p, octavia_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Octavia R-Trip</Label>
                      <Input value={editRoute.octavia_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, octavia_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Karoq 1-Way</Label>
                      <Input value={editRoute.karoq_one_way} onChange={(e) => setEditRoute(p => ({ ...p, karoq_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Karoq R-Trip</Label>
                      <Input value={editRoute.karoq_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, karoq_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                  </div>
=======
                      <Label className="text-[10px] text-muted-foreground">Vito One-Way</Label>
                      <Input value={editRoute.vito_one_way} onChange={(e) => setEditRoute(p => ({ ...p, vito_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Lodgy One-Way</Label>
                      <Input value={editRoute.dacia_one_way} onChange={(e) => setEditRoute(p => ({ ...p, dacia_one_way: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Vito Round-Trip</Label>
                      <Input value={editRoute.vito_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, vito_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Lodgy Round-Trip</Label>
                      <Input value={editRoute.dacia_round_trip} onChange={(e) => setEditRoute(p => ({ ...p, dacia_round_trip: e.target.value }))} className="bg-secondary/50 border-border text-xs h-8" type="number" placeholder="Optional" />
                    </div>
                  </div>
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
                  <div className="flex gap-2">
                    <Button onClick={saveEditRoute} size="sm" className="gold-gradient text-primary-foreground text-xs flex-1">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                    <Button onClick={() => setEditingRouteId(null)} size="sm" variant="outline" className="text-xs border-border">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="text-foreground font-medium">Vito:</span> {Number(route.vito_one_way).toLocaleString()} DH
                    {route.vito_round_trip && <span className="text-gold"> / {Number(route.vito_round_trip).toLocaleString()} RT</span>}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Lodgy:</span> {Number(route.dacia_one_way).toLocaleString()} DH
                    {route.dacia_round_trip && <span className="text-gold"> / {Number(route.dacia_round_trip).toLocaleString()} RT</span>}
                  </div>
<<<<<<< HEAD
                  <div>
                    <span className="text-foreground font-medium">Octavia:</span> {Number(route.octavia_one_way).toLocaleString()} DH
                    {route.octavia_round_trip && <span className="text-gold"> / {Number(route.octavia_round_trip).toLocaleString()} RT</span>}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Karoq:</span> {Number(route.karoq_one_way).toLocaleString()} DH
                    {route.karoq_round_trip && <span className="text-gold"> / {Number(route.karoq_round_trip).toLocaleString()} RT</span>}
                  </div>
=======
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
                </div>
              )}
            </motion.div>
          ))}

          {routes.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No routes configured</p>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Date Range Picker */}
          <div className="glass rounded-xl p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-secondary/50 border-border text-xs">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    {format(analyticsFrom, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={analyticsFrom}
                    onSelect={(d) => d && setAnalyticsFrom(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-secondary/50 border-border text-xs">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    {format(analyticsTo, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={analyticsTo}
                    onSelect={(d) => d && setAnalyticsTo(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Quick presets */}
            <div className="flex gap-2 mt-2">
              {[
                { label: '7D', days: 7 },
                { label: '30D', days: 30 },
                { label: '90D', days: 90 },
                { label: 'All', days: 9999 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    const from = new Date();
                    from.setDate(from.getDate() - p.days);
                    from.setHours(0, 0, 0, 0);
                    setAnalyticsFrom(from);
                    const to = new Date();
                    to.setHours(23, 59, 59, 999);
                    setAnalyticsTo(to);
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:border-gold hover:text-gold transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-lg font-serif font-bold text-gold">{analytics.totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">DH</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmed</p>
              <p className="text-lg font-serif font-bold text-emerald-400">{analytics.confirmedRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">DH</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
              <p className="text-lg font-serif font-bold text-destructive">{analytics.pendingRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">DH</p>
            </div>
          </div>

          {/* Daily Revenue */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" /> Daily Revenue
            </h3>
            <div className="space-y-2">
              {analytics.dailyRevenue.map((day) => {
                const maxRev = Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1);
                const pct = (day.revenue / maxRev) * 100;
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">{day.date}</span>
                    <div className="flex-1 h-5 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full gold-gradient"
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-16 text-right">{day.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground w-6">({day.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Routes */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" /> Most Popular Routes
            </h3>
            {analytics.topRoutes.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRoutes.map((r, i) => {
                  const maxCount = analytics.topRoutes[0]?.count || 1;
                  const pct = (r.count / maxCount) * 100;
                  return (
                    <div key={r.route}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground'
                            }`}>{i + 1}</span>
                          {r.route}
                        </span>
                        <span className="text-xs text-muted-foreground">{r.count} trips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gold/40"
                          />
                        </div>
                        <span className="text-xs font-medium text-gold w-20 text-right">{r.revenue.toLocaleString()} DH</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">No booking data yet</p>
            )}
          </div>

          {/* Summary Footer */}
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-3xl font-serif font-bold text-foreground">{analytics.totalBookings}</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">WhatsApp Number</Label>
            <p className="text-xs text-muted-foreground mb-2">The number customers will contact via WhatsApp (without +, e.g. 212600000000)</p>
            <div className="flex gap-2">
              <Input
                placeholder="212600000000"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="bg-secondary/50 border-border flex-1"
              />
              <Button
                disabled={savingWhatsapp}
                onClick={async () => {
                  setSavingWhatsapp(true);
                  await supabase.from("settings").update({ value: whatsappNumber } as any).eq("key", "whatsapp_number");
                  setSavingWhatsapp(false);
                  toast.success("WhatsApp number updated!");
                }}
                className="gold-gradient text-primary-foreground"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="glass rounded-xl p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-3 block">Push Notifications</Label>
            <NotificationSettings />
          </div>
        </div>
      )}


      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="glass border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Ref</span><span className="text-gold font-mono">{selectedBooking.id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Name</span><span className="text-foreground">{selectedBooking.passenger_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Phone</span><span className="text-foreground">{selectedBooking.phone}</span></div>
              {selectedBooking.email && (
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Email</span><span className="text-foreground">{selectedBooking.email}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Room/Passengers</span><span className="text-foreground font-medium">{selectedBooking.room_or_passengers || '—'}</span></div>
              {selectedBooking.comment && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-muted-foreground text-sm">Comment / Request</span>
                  <div className="bg-secondary/30 p-2.5 rounded-lg text-sm text-foreground italic border border-border/50">
                    "{selectedBooking.comment}"
                  </div>
                </div>
              )}
              {selectedBooking.pickup_time && (
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Pickup Time</span><span className="text-foreground">{selectedBooking.pickup_time}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Route</span><span className="text-foreground">{selectedBooking.pickup}{selectedBooking.dropoff ? ` → ${selectedBooking.dropoff}` : ''}</span></div>
<<<<<<< HEAD
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Vehicle</span>
                <span className="text-foreground">
                  {selectedBooking.vehicle === 'Vito' ? t('mercedesVito') :
                    selectedBooking.vehicle === 'Dacia' ? t('daciaLodgy') :
                      selectedBooking.vehicle === 'Octavia' ? t('skodaOctavia') :
                        selectedBooking.vehicle === 'Karoq' ? t('skodaKaroq') : selectedBooking.vehicle}
                </span>
              </div>
=======
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Vehicle</span><span className="text-foreground">{selectedBooking.vehicle === 'Vito' ? 'Mercedes vito de luxe' : 'Dacia Lodgy'}</span></div>
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Type</span><span className="text-foreground">{selectedBooking.trip_type.replace('_', ' ')}</span></div>
              {selectedBooking.hours && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Hours</span><span className="text-foreground">{selectedBooking.hours}</span></div>}
              <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground text-sm">Price</span><span className="text-gold font-serif font-bold text-xl">{Number(selectedBooking.price).toLocaleString()} DH</span></div>
              <Badge className={`${statusColors[selectedBooking.status]} border`}>{selectedBooking.status}</Badge>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { updateStatus(selectedBooking.id, "Confirmed"); setSelectedBooking(null); }}>Confirm</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { updateStatus(selectedBooking.id, "Cancelled"); setSelectedBooking(null); }}>Cancel</Button>
              </div>
              <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(selectedBooking)}>
                <Trash2 className="w-4 h-4 mr-2" /> {t("deleteBooking")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Booking Alert */}
      <Dialog open={!!alertBooking} onOpenChange={() => setAlertBooking(null)}>
        <DialogContent className="glass border-gold/30 max-w-sm gold-glow">
          <DialogHeader>
            <DialogTitle className="font-serif text-gold text-xl flex items-center gap-2">
              <Bell className="w-5 h-5" /> New Booking!
            </DialogTitle>
          </DialogHeader>
          {alertBooking && (
            <div className="space-y-2">
              <p className="text-foreground font-semibold">{alertBooking.passenger_name}</p>
              <p className="text-muted-foreground text-sm">{alertBooking.pickup}{alertBooking.dropoff ? ` → ${alertBooking.dropoff}` : ''}</p>
              <p className="text-gold font-serif font-bold text-2xl">{Number(alertBooking.price).toLocaleString()} DH</p>
              <Button className="w-full gold-gradient text-primary-foreground" onClick={() => { setSelectedBooking(alertBooking); setAlertBooking(null); }}>
                View Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Route Dialog */}
      <Dialog open={showAddRoute} onOpenChange={setShowAddRoute}>
        <DialogContent className="glass border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground flex items-center gap-2">
              <Route className="w-5 h-5 text-gold" /> Add New Route
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Pickup Location</Label>
              <Input
                placeholder="e.g. Casablanca"
                value={newRoute.pickup}
                onChange={(e) => setNewRoute((p) => ({ ...p, pickup: e.target.value }))}
                className="bg-secondary/50 border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dropoff Location</Label>
              <Input
                placeholder="e.g. Marrakech"
                value={newRoute.dropoff}
                onChange={(e) => setNewRoute((p) => ({ ...p, dropoff: e.target.value }))}
                className="bg-secondary/50 border-border mt-1"
              />
            </div>
<<<<<<< HEAD
            <div className="space-y-3">
              {/* Vito Row */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/50">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Vito One-Way</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    value={newRoute.vito_one_way}
                    onChange={(e) => setNewRoute((p) => ({ ...p, vito_one_way: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Vito Round-Trip</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={newRoute.vito_round_trip}
                    onChange={(e) => setNewRoute((p) => ({ ...p, vito_round_trip: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Lodgy Row */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/50">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Lodgy One-Way</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1400"
                    value={newRoute.dacia_one_way}
                    onChange={(e) => setNewRoute((p) => ({ ...p, dacia_one_way: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Lodgy Round-Trip</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={newRoute.dacia_round_trip}
                    onChange={(e) => setNewRoute((p) => ({ ...p, dacia_round_trip: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Octavia Row */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/50">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Octavia One-Way</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1450"
                    value={newRoute.octavia_one_way}
                    onChange={(e) => setNewRoute((p) => ({ ...p, octavia_one_way: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Octavia Round-Trip</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={newRoute.octavia_round_trip}
                    onChange={(e) => setNewRoute((p) => ({ ...p, octavia_round_trip: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Karoq Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Karoq One-Way</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1600"
                    value={newRoute.karoq_one_way}
                    onChange={(e) => setNewRoute((p) => ({ ...p, karoq_one_way: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Karoq Round-Trip</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={newRoute.karoq_round_trip}
                    onChange={(e) => setNewRoute((p) => ({ ...p, karoq_round_trip: e.target.value }))}
                    className="bg-secondary/50 border-border mt-1 h-8 text-sm"
                  />
                </div>
=======
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Vito One-Way (DH)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={newRoute.vito_one_way}
                  onChange={(e) => setNewRoute((p) => ({ ...p, vito_one_way: e.target.value }))}
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Lodgy One-Way (DH)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1400"
                  value={newRoute.dacia_one_way}
                  onChange={(e) => setNewRoute((p) => ({ ...p, dacia_one_way: e.target.value }))}
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Vito Round Trip (optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={newRoute.vito_round_trip}
                  onChange={(e) => setNewRoute((p) => ({ ...p, vito_round_trip: e.target.value }))}
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Lodgy Round Trip (optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2400"
                  value={newRoute.dacia_round_trip}
                  onChange={(e) => setNewRoute((p) => ({ ...p, dacia_round_trip: e.target.value }))}
                  className="bg-secondary/50 border-border mt-1"
                />
>>>>>>> 0f926a96f93768b504e4b619e23c14d3db7093c8
              </div>
            </div>
            <Button onClick={addRoute} className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Save Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install Instructions Modal */}
      <Dialog open={showInstallHelp} onOpenChange={setShowInstallHelp}>
        <DialogContent className="glass border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground flex items-center gap-2">
              <Download className="w-5 h-5 text-gold" /> How to Install this App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🍎</span>
                <h3 className="font-semibold text-foreground">iPhone / iPad</h3>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Tap the <strong className="text-foreground">Share</strong> button ⬆️ in Safari</li>
                <li>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong> ➕</li>
                <li>Tap <strong className="text-foreground">"Add"</strong> to confirm</li>
              </ol>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <h3 className="font-semibold text-foreground">Android</h3>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Tap the Chrome menu <strong className="text-foreground">⋮</strong> (top right)</li>
                <li>Select <strong className="text-foreground">"Install App"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></li>
                <li>Tap <strong className="text-foreground">"Install"</strong> to confirm</li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Once installed, the app opens in full-screen without the browser bar.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass border-border max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteMsg")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bookNow").includes("Book") ? "Cancel" : "Annuler"}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && deleteBooking(deleteTarget.id)}>
              {t("deleteBooking")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
