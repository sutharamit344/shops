"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  createSession,
  getSession,
  listenSession,
  listenSessionOrders,
  placeOrder,
  getTableName,
  getTable,
  joinSession,
} from "@/lib/rtdb";
import { useAuth } from "@/hooks/useAuth";
import SafeImage from "@/components/UI/SafeImage";
import Dialog from "@/components/UI/Dialog";
import {
  ShoppingBag, Plus, Minus, ChevronRight, Clock,
  CheckCircle2, UtensilsCrossed, AlertCircle, Loader2,
  Store, X, Send, ChevronLeft, StickyNote, Search
} from "lucide-react";

// ── Order Status Display ──────────────────────────────────────────
const STATUS_STYLES = {
  placed: {
    label: "Order Placed",
    bg: "bg-blue-50/80 dark:bg-blue-950/20",
    border: "border-blue-100 dark:border-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    pulse: true,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-indigo-50/80 dark:bg-indigo-950/20",
    border: "border-indigo-100 dark:border-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
    pulse: true,
  },
  preparing: {
    label: "Being Prepared",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    border: "border-amber-100 dark:border-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    pulse: true,
    animateSpin: true,
  },
  ready: {
    label: "Ready to Serve!",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
    border: "border-emerald-100 dark:border-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    pulse: true,
  },
  served: {
    label: "Served",
    bg: "bg-zinc-50 dark:bg-zinc-900/40",
    border: "border-zinc-200/60 dark:border-zinc-800/80",
    text: "text-zinc-700 dark:text-zinc-400",
    dot: "bg-zinc-400",
    pulse: false,
  },
};

const ITEM_STATUS_STYLES = {
  placed: { label: "Pending", text: "text-zinc-500 dark:text-zinc-450", bg: "bg-zinc-100 dark:bg-zinc-800", dot: "bg-zinc-400" },
  confirmed: { label: "Confirmed", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-950/15", dot: "bg-blue-400" },
  preparing: { label: "Preparing", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/60 dark:bg-amber-950/20", dot: "bg-amber-400", animateSpin: true },
  ready: { label: "Ready!", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/15", dot: "bg-emerald-500" },
  served: { label: "Served", text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-950/15", dot: "bg-indigo-550" },
  cancelled: { label: "Cancelled", text: "text-rose-600 dark:text-rose-450", bg: "bg-rose-50/50 dark:bg-rose-950/15", dot: "bg-rose-500" },
};

function OrderStatusTracker({ order }) {
  const status = order.status || "placed";
  const style = STATUS_STYLES[status] || STATUS_STYLES.placed;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-[#0A0A0F]/45 dark:text-zinc-400 uppercase tracking-widest">Order Status</p>
        <span className="text-[10px] font-bold text-[#0A0A0F]/30 dark:text-zinc-500">
          {Math.floor((Date.now() - order.placedAt) / 60000)}m ago
        </span>
      </div>
      {/* Items summary */}
      <div className="space-y-1">
        {order.items.map((item, i) => {
          const itemStatus = item.status || "placed";
          const isCancelled = itemStatus === "cancelled";
          const itemStyle = ITEM_STATUS_STYLES[itemStatus] || ITEM_STATUS_STYLES.placed;

          return (
            <div key={i} className="flex items-center justify-between text-[12px] py-1 border-b border-black/[0.02] dark:border-zinc-800/40 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* Status Indicator Dot/Spinner */}
                {itemStyle.animateSpin ? (
                  <Loader2 size={10} className="animate-spin text-amber-500 shrink-0" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${itemStyle.dot} shrink-0`} />
                )}

                <span className={`font-semibold text-[#0A0A0F] dark:text-zinc-200 truncate ${isCancelled ? "line-through text-zinc-400 font-medium" : ""}`}>
                  <span className={`font-black ${isCancelled ? "text-zinc-400" : "text-[#FF6A00]"}`}>{item.qty}×</span> {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Compact Item Status tag */}
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${itemStyle.bg} ${itemStyle.text}`}>
                  {itemStyle.label}
                </span>

                {item.price && (
                  <span className={`font-bold text-[#0A0A0F]/40 dark:text-zinc-550 ${isCancelled ? "line-through text-zinc-300" : ""}`}>
                    ₹{item.price * item.qty}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Live Status Banner */}
      <div className={`mt-3 flex items-center justify-between p-2.5 rounded-md border ${style.bg} ${style.border} ${style.text}`}>
        <div className="flex items-center gap-2">
          {style.animateSpin ? (
            <Loader2 size={13} className="animate-spin text-amber-500" />
          ) : (
            <span className={`w-2 h-2 rounded-full ${style.dot} ${style.pulse ? "animate-pulse" : ""}`} />
          )}
          <span className="text-[12px] font-bold tracking-tight">
            {style.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TableOrderClient({ shop, tableId }) {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const requireApproval = shop.qrOrderingConfig?.requireWaiterApproval ?? false;
  const SESSION_KEY = `qr_session_${shop.id}_${tableId}`;

  const [phase, setPhase] = useState("init");
  // init → identify → pending → menu → tracking
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showClosedDialog, setShowClosedDialog] = useState(false);
  const unsubSession = useRef(null);
  const unsubOrders = useRef(null);

  // Guest details state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Get table info from RTDB tables node
  const [tableName, setTableName] = useState(`Table ${tableId}`);

  // Fetch clean table name from RTDB on mount
  useEffect(() => {
    if (!shop?.id || !tableId) return;
    (async () => {
      const name = await getTableName(shop.id, tableId);
      setTableName(name);
    })();
  }, [shop?.id, tableId]);

  const getIdentifier = () => {
    if (user) {
      return {
        id: user.uid,
        name: user.displayName || user.email || "Google Customer",
        phone: user.phoneNumber || "",
      };
    }
    const saved = sessionStorage.getItem(`guest_info_${shop.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.phone) {
          if (!parsed.id) {
            parsed.id = "guest_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
            sessionStorage.setItem(`guest_info_${shop.id}`, JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  };

  const getSessionCode = (sid) => {
    if (!sid) return "";
    let hash = 0;
    for (let i = 0; i < sid.length; i++) {
      hash += sid.charCodeAt(i);
    }
    return ((hash % 90) + 10).toString();
  };

  const joinExistingSession = async (sid, identity) => {
    await joinSession(shop.id, sid, identity.name, identity.phone, identity.id);
    setSessionId(sid);
    subscribeToSession(sid);
    subscribeToOrders(sid);

    const s = await getSession(shop.id, sid);
    if (s) {
      setPhase(s.status === "pending" ? "pending" : "menu");
    }
  };

  // Session lifecycle & Auth hook synchronization
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      // 1. Check if identified
      const identity = getIdentifier();

      if (!identity) {
        setPhase("identify");
        return;
      }

      // 2. Check if there is an existing session in sessionStorage
      const existingSessionId = sessionStorage.getItem(SESSION_KEY);
      if (existingSessionId) {
        const sess = await getSession(shop.id, existingSessionId);
        if (sess) {
          if (sess.status !== "closed" && sess.status !== "rejected") {
            await joinExistingSession(existingSessionId, identity);
            return;
          } else if (sess.status === "closed") {
            // It is closed. Set state to show the receipt for this closed session!
            setSessionId(existingSessionId);
            setSession(sess);
            subscribeToSession(existingSessionId);
            subscribeToOrders(existingSessionId);
            setPhase("receipt");
            return;
          } else if (sess.status === "rejected") {
            // It was rejected. Set state to show the rejected page!
            setSessionId(existingSessionId);
            setSession(sess);
            subscribeToSession(existingSessionId);
            subscribeToOrders(existingSessionId);
            setPhase("rejected");
            return;
          }
        }
        sessionStorage.removeItem(SESSION_KEY);
      }

      // 3. User is identified, but has no active session. Start a new separate session!
      await startNewSession(identity.name, identity.phone, identity.id);
    })();

    return () => {
      unsubSession.current?.();
      unsubOrders.current?.();
    };
  }, [authLoading, user]);

  const initWithExistingSession = async (sid) => {
    const s = await getSession(shop.id, sid);
    if (!s || s.status === "closed") {
      sessionStorage.removeItem(SESSION_KEY);
      setShowClosedDialog(true);
      setPhase("closed");
      return;
    }
    setSessionId(sid);
    subscribeToSession(sid);
    subscribeToOrders(sid);
    setPhase(s.status === "pending" ? "pending" : "menu");
  };

  const startNewSession = async (customerName = "", customerPhone = "", customerId = "") => {
    setPhase("loading");
    // Ensure we fetch the most recent name
    const cleanTableName = await getTableName(shop.id, tableId);
    setTableName(cleanTableName);

    const sid = await createSession(
      shop.id,
      tableId,
      cleanTableName,
      requireApproval,
      customerName,
      customerPhone,
      customerId
    );
    sessionStorage.setItem(SESSION_KEY, sid);
    setSessionId(sid);
    subscribeToSession(sid);
    subscribeToOrders(sid);
    setPhase(requireApproval ? "pending" : "menu");
  };

  const handleGuestSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!guestName.trim() || guestPhone.length !== 10) return;

    const guestId = "guest_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    const guestInfo = {
      id: guestId,
      name: guestName.trim(),
      phone: guestPhone.trim()
    };

    sessionStorage.setItem(
      `guest_info_${shop.id}`,
      JSON.stringify(guestInfo)
    );

    setPhase("loading");
    await startNewSession(guestInfo.name, guestInfo.phone, guestInfo.id);
  };

  const subscribeToSession = (sid) => {
    unsubSession.current?.();
    unsubSession.current = listenSession(shop.id, sid, (s) => {
      if (!s) return;
      setSession(s);
      if (s.tableName) setTableName(s.tableName);
      if (s.status === "active") {
        setPhase("menu");
      } else if (s.status === "pending") {
        setPhase("pending");
      } else if (s.status === "closed") {
        setPhase("receipt");
      } else if (s.status === "rejected") {
        setPhase("rejected");
      }
    });
  };

  const subscribeToOrders = (sid) => {
    unsubOrders.current?.();
    unsubOrders.current = listenSessionOrders(shop.id, sid, (o) => {
      setOrders(o.sort((a, b) => b.placedAt - a.placedAt));
    });
  };

  // Cart helpers
  const cartQty = (name) => cart.find((i) => i.name === name)?.qty || 0;
  const updateCart = (item, qty) => {
    if (qty <= 0) setCart((c) => c.filter((i) => i.name !== item.name));
    else {
      const exists = cart.find((i) => i.name === item.name);
      if (exists) setCart((c) => c.map((i) => i.name === item.name ? { ...i, qty } : i));
      else setCart((c) => [...c, { ...item, qty }]);
    }
  };
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (parseFloat(i.price || 0) * i.qty), 0);

  const handlePlaceOrder = async () => {
    if (!cart.length || !sessionId) return;
    setPlacing(true);
    await placeOrder(
      shop.id,
      sessionId,
      tableId,
      tableName,
      cart.map((i) => ({ name: i.name, price: i.price || null, qty: i.qty, unit: i.unit || null })),
      note
    );
    setCart([]);
    setNote("");
    setShowCart(false);
    setPlacing(false);
  };

  // Build menu
  const menuSections = shop.menu || [];
  const allItems = menuSections.flatMap((sec) =>
    (sec.items || []).map((item) => ({ ...item, category: sec.name || sec.category }))
  );
  const categories = ["all", ...new Set(menuSections.map((s) => s.name || s.category))];
  const displayItems = activeCategory === "all"
    ? allItems
    : allItems.filter((i) => i.category === activeCategory);

  const hasDietOptions = allItems.some((item) => item.diet === "veg" || item.diet === "nonveg");

  const filteredItems = displayItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );

    const matchesDiet = dietFilter === "all" || item.diet === dietFilter;

    return matchesSearch && matchesDiet;
  });

  const activeOrders = orders.filter((o) => o.status !== "served" && o.status !== "cancelled");

  // ── Phase: identify (Google login or manually fill name and number)
  if (phase === "identify") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-5 md:p-6 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <div className="w-11 h-11 rounded-md bg-[#FF6A00]/10 flex items-center justify-center mx-auto text-[#FF6A00] mb-2 border border-[#FF6A00]/10">
              <Store size={20} />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{shop.name}</h2>
            <p className="text-[11px] text-[#FF6A00] font-black uppercase tracking-wider bg-[#FF6A00]/5 px-2.5 py-0.5 rounded-full w-fit mx-auto border border-[#FF6A00]/10">{tableName}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full h-9 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-[#FF6A00] dark:hover:bg-[#FF6A00] text-white dark:text-zinc-900 hover:text-white dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.55 0 2.96.57 4.05 1.5l3.1-3.1C18.82 1.345 15.66 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.8 0 12.24-5.44 12.24-12.24 0-.82-.07-1.63-.22-2.415H12.24z" />
              </svg>
              Sign In with Google
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">or continue as guest</span>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-0.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold outline-none focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-0.5">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number for order updates"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold outline-none focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                disabled={!guestName.trim() || guestPhone.length !== 10}
                className="w-full h-9 rounded-md bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-1"
              >
                Start Ordering <ChevronRight size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: loading
  if (phase === "loading" || phase === "init") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-md bg-[#FF6A00]/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 size={22} className="animate-spin text-[#FF6A00]" />
          </div>
          <p className="text-[13px] font-bold text-[#0A0A0F]/40">Starting your session...</p>
        </div>
      </div>
    );
  }

  // ── Phase: pending (waiting for waiter approval)
  if (phase === "pending") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-md bg-amber-50 border-2 border-amber-100 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-500" />
          </div>
          <h2 className="text-[20px] font-bold text-[#0A0A0F] mb-2 tracking-tight">Waiting for Approval</h2>
          <p className="text-[13px] text-[#0A0A0F]/50 font-medium leading-relaxed mb-6">
            A waiter will activate your session shortly. Please wait.
          </p>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-[11px] text-[#0A0A0F]/30 font-medium mt-6">
            {shop.name} · {tableName}
          </p>
        </div>
      </div>
    );
  }

  // ── Phase: rejected
  if (phase === "rejected") {
    const handleStartNewOrder = () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-6 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-md bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Scan Request Denied</h2>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-2">
              Your table ordering scan request has been rejected or denied by the staff. Please scan the QR code again or contact a waiter for assistance.
            </p>
          </div>

          <button
            onClick={handleStartNewOrder}
            className="w-full h-10 rounded-md bg-[#0A0A0F] dark:bg-zinc-100 text-white dark:text-[#0A0A0F] text-[12px] font-bold hover:bg-[#0A0A0F]/80 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            Got it / Try Again
          </button>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium pt-1">
            {shop.name} · {tableName}
          </p>
        </div>
      </div>
    );
  }

  // ── Phase: receipt
  if (phase === "receipt" || phase === "closed") {
    // Consolidate ordered items
    const consolidatedItems = {};
    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      order.items?.forEach((item) => {
        const price = parseFloat(item.price || 0);
        if (consolidatedItems[item.name]) {
          consolidatedItems[item.name].qty += parseInt(item.qty || 1);
        } else {
          consolidatedItems[item.name] = {
            name: item.name,
            price: price,
            qty: parseInt(item.qty || 1),
          };
        }
      });
    });
    const itemsArray = Object.values(consolidatedItems);
    const finalTotal = itemsArray.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleStartNewOrder = () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16 flex flex-col items-center">
        {/* Header */}
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-black/[0.05] dark:border-zinc-800 sticky top-0 z-20">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md overflow-hidden border border-black/[0.05] relative bg-zinc-50 flex-shrink-0 flex items-center justify-center">
                <SafeImage src={shop.logo} alt={shop.name} fill unoptimized className="object-cover" fallbackIcon={Store} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-[#0A0A0F] dark:text-zinc-100 truncate">{shop.name}</h1>
                <p className="text-[10px] text-[#0A0A0F]/45 dark:text-zinc-555 font-medium">{tableName}</p>
              </div>
            </div>
            <button
              onClick={handleStartNewOrder}
              className="h-7 px-2.5 rounded-md border border-black/[0.08] dark:border-zinc-850 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Start New Order
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md px-4 mt-6 space-y-4 flex-1">
          {/* Status Seal Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-5 text-center shadow-2xs relative overflow-hidden">
            {/* Visual background accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF6A00]/5 rounded-full blur-xl pointer-events-none" />

            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto mb-3.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Thank You for Your Visit!</h2>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1 max-w-[280px] mx-auto">
              Your bill has been settled. Below is the summary of your orders.
            </p>
            <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-zinc-800/80 flex items-center justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/20 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 animate-pulse" />
                Payment Status: Paid
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-[9.5px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest border-b border-black/[0.04] dark:border-zinc-800 pb-1.5">
              Dining Details
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 text-xs">
              <div>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Customer Name</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">{getIdentifier()?.name || "Guest"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">WhatsApp Phone</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">{getIdentifier()?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Table & Session</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">
                  {tableName} {sessionId && `[#${getSessionCode(sessionId)}]`}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Checked Out At</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">
                  {session?.closedAt ? new Date(session.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Items Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-md border border-black/[0.06] dark:border-zinc-800 p-4 shadow-2xs flex flex-col">
            <div className="text-[9.5px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-widest border-b border-black/[0.04] dark:border-zinc-800 pb-1.5 mb-3">
              Order Receipt
            </div>

            {itemsArray.length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-zinc-400 dark:text-zinc-555">
                No items ordered.
              </div>
            ) : (
              <>
                <div className="divide-y divide-black/[0.04] dark:divide-zinc-800/80 space-y-2 pb-3 flex-1">
                  {itemsArray.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-medium text-zinc-900 dark:text-zinc-200 pt-2 first:pt-0">
                      <div>
                        <span className="font-bold text-zinc-950 dark:text-zinc-50">
                          {item.name}
                        </span>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {item.qty} × ₹{item.price}
                        </p>
                      </div>
                      <span className="font-bold text-[#FF6A00]">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/[0.06] dark:border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Total Paid Bill</span>
                  <span className="text-base font-black text-[#FF6A00]">₹{finalTotal}</span>
                </div>
              </>
            )}
          </div>

          {/* Action button at bottom */}
          <div className="pt-2">
            <button
              onClick={handleStartNewOrder}
              className="w-full h-11 rounded-md bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start New Seating / Session <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: menu
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-32">
      {/* Shop Header */}
      <div className="bg-white border-b border-black/[0.05] sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden border border-black/[0.05] relative flex-shrink-0 bg-zinc-50">
            <SafeImage src={shop.logo} alt={shop.name} fill unoptimized className="object-cover" fallbackIcon={Store} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[14px] font-bold text-[#0A0A0F] tracking-tight truncate">{shop.name}</h1>
            <p className="text-[11px] text-[#0A0A0F]/40 font-medium">
              {tableName} {sessionId && `[#${getSessionCode(sessionId)}]`}
            </p>
          </div>
          {orders.length > 0 && (
            <button
              onClick={() => setShowOrdersDialog(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] text-[11px] font-bold cursor-pointer"
            >
              <Clock size={12} /> {orders.length} order{orders.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto px-4 pb-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 text-[#0A0A0F]/30" size={13} />
            <input
              type="text"
              placeholder="Search dishes or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-8 rounded-md bg-[#0A0A0F]/[0.03] border border-black/[0.04] outline-none text-[11px] font-bold focus:border-[#FF6A00]/40 focus:bg-white transition-all text-[#0A0A0F] placeholder-[#0A0A0F]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[#0A0A0F]/40 hover:text-[#0A0A0F] transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-7 px-3 rounded-md text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat
                ? "bg-[#0A0A0F] text-white"
                : "bg-black/[0.03] text-[#0A0A0F]/50 hover:bg-black/[0.06]"
                }`}
            >
              {cat === "all" ? "All Items" : cat}
            </button>
          ))}
        </div>

        {/* Dietary preference filter tabs */}
        {hasDietOptions && (
          <div className="max-w-lg mx-auto px-4 pb-3 flex gap-1.5 border-t border-black/[0.03] pt-2.5">
            <button
              onClick={() => setDietFilter("all")}
              className={`h-6 px-2.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                dietFilter === "all"
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-xs"
                  : "bg-white border-black/[0.08] text-[#0A0A0F]/60 hover:bg-black/[0.02]"
              }`}
            >
              All Diet
            </button>
            <button
              onClick={() => setDietFilter("veg")}
              className={`h-6 px-2.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                dietFilter === "veg"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                  : "bg-white border-black/[0.08] text-emerald-600/80 hover:bg-emerald-50/40"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Veg
            </button>
            <button
              onClick={() => setDietFilter("nonveg")}
              className={`h-6 px-2.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                dietFilter === "nonveg"
                  ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                  : "bg-white border-black/[0.08] text-rose-600/80 hover:bg-rose-50/40"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Non-Veg
            </button>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={32} className="mx-auto text-[#0A0A0F]/10 mb-3" />
            <p className="text-[13px] text-[#0A0A0F]/45 font-medium">No items available.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={32} className="mx-auto text-[#0A0A0F]/10 mb-3 animate-pulse" />
            <p className="text-[13px] text-[#0A0A0F]/50 font-bold">No results found</p>
            <p className="text-[11px] text-[#0A0A0F]/30 font-medium mt-1">
              {searchQuery
                ? `We couldn't find any items matching "${searchQuery}"`
                : "No items match the selected dietary preference"
              }
            </p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const qty = cartQty(item.name);
            const outOfStock = typeof item.stock === "number" && item.stock <= 0;
            return (
              <div key={idx} className={`bg-white rounded-md border border-black/[0.06] overflow-hidden flex items-center gap-3 pl-0 py-0 pr-3 transition-all ${outOfStock ? "opacity-50" : "hover:border-black/[0.12]"} h-[84px]`}>
                {item.image ? (
                  <div className="w-[84px] h-[84px] relative flex-shrink-0 bg-zinc-50 overflow-hidden">
                    <SafeImage src={item.image} alt={item.name} fill unoptimized className="object-cover" fallbackIcon={ShoppingBag} iconSize={20} />
                    {/* Overlay Badges */}
                    <div className="absolute top-0 left-0 z-10 flex flex-col items-start">
                      {item.featured && (
                        <span className="text-[8px] font-black bg-[#FF6A00] text-white px-1.5 py-0.5 rounded-br-lg uppercase tracking-wider shadow-xs">Featured</span>
                      )}
                      {(item.isNew || item.new) && (
                        <span className="text-[8px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-br-lg uppercase tracking-wider shadow-xs">New</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-[84px] h-[84px] relative flex-shrink-0 bg-zinc-50 overflow-hidden flex items-center justify-center text-[#0A0A0F]/20">
                    <ShoppingBag size={20} />
                    {/* Overlay Badges */}
                    <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-0.5">
                      {item.featured && (
                        <span className="text-[8px] font-black bg-[#FF6A00] text-white px-1.5 py-0.5 rounded-br-lg uppercase tracking-wider shadow-xs">Featured</span>
                      )}
                      {(item.isNew || item.new) && (
                        <span className="text-[8px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-br-lg uppercase tracking-wider shadow-xs">New</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.diet === "veg" && (
                      <div className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Vegetarian">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      </div>
                    )}
                    {item.diet === "nonveg" && (
                      <div className="w-3.5 h-3.5 border border-rose-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Non-Vegetarian">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      </div>
                    )}
                    <h3 className="text-[13px] font-bold text-[#0A0A0F] tracking-tight truncate">{item.name}</h3>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-[#0A0A0F]/50 font-medium line-clamp-1 mt-0.5 leading-snug">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-black text-[#FF6A00]">
                      {item.price ? `₹${item.price}` : "Ask staff"}
                    </span>
                    {typeof item.stock === "number" && item.stock > 0 && item.stock <= 5 && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase">
                        {item.stock} left
                      </span>
                    )}
                    {outOfStock && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase">
                        Sold out
                      </span>
                    )}
                  </div>
                </div>

                {!outOfStock && (
                  <div className="flex-shrink-0">
                    {qty > 0 ? (
                      <div className="flex items-center bg-[#FF6A00] text-white rounded-md overflow-hidden h-8 border border-[#FF6A00] shadow-sm shadow-[#FF6A00]/10">
                        <button onClick={() => updateCart(item, qty - 1)} className="w-8 h-full flex items-center justify-center hover:bg-black/20 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-[12px] font-black min-w-[12px] text-center">{qty}</span>
                        <button onClick={() => updateCart(item, qty + 1)} className="w-8 h-full flex items-center justify-center hover:bg-black/20 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateCart(item, 1)}
                        className="w-8 h-8 rounded-md bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white transition-all shadow-2xs"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>



      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-[#0A0A0F] text-white px-4 py-3 rounded-md shadow-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#FF6A00] text-white text-[11px] font-black flex items-center justify-center">
                  {totalItems}
                </span>
                <span className="text-[13px] font-bold">View Cart</span>
              </div>
              {totalPrice > 0 && (
                <span className="text-[13px] font-black text-[#FF6A00]">₹{totalPrice}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Your Cart"
        subtitle={`${tableName} ${sessionId ? `[#${getSessionCode(sessionId)}]` : ""}`}
        maxWidth="max-w-sm"
        rounded="rounded-md"
      >
        <div className="space-y-3 pt-1">
          {cart.length === 0 ? (
            <p className="text-center py-8 text-[13px] text-[#0A0A0F]/40 font-medium">Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0A0A0F] truncate">{item.name}</p>
                    {item.price && <p className="text-[11px] font-black text-[#FF6A00]">₹{item.price * item.qty}</p>}
                  </div>
                  <div className="flex items-center bg-white border border-black/[0.1] rounded-md overflow-hidden h-8 flex-shrink-0">
                    <button onClick={() => updateCart(item, item.qty - 1)} className="w-8 h-full flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-[12px] font-black text-[#0A0A0F] min-w-[20px] text-center">{item.qty}</span>
                    <button onClick={() => updateCart(item, item.qty + 1)} className="w-8 h-full flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Note */}
              <button
                onClick={() => setShowNote(!showNote)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A0A0F]/40 hover:text-[#0A0A0F] transition-colors"
              >
                <StickyNote size={12} /> {showNote ? "Remove note" : "Add note for kitchen"}
              </button>
              {showNote && (
                <textarea
                  rows={2}
                  placeholder="e.g. Less spicy, no onion..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-md border border-black/[0.08] text-[12px] font-medium bg-zinc-50 outline-none focus:border-[#FF6A00]/40 resize-none"
                />
              )}

              {totalPrice > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.05]">
                  <span className="text-[13px] font-bold text-[#0A0A0F]/60">Total</span>
                  <span className="text-[15px] font-black text-[#FF6A00]">₹{totalPrice}</span>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full h-11 rounded-md bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6A00]/20 disabled:opacity-60"
              >
                {placing ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                {placing ? "Placing Order..." : "Place Order"}
              </button>
              <p className="text-center text-[10px] text-[#0A0A0F]/30 font-medium">Pay at the counter after your meal.</p>
            </>
          )}
        </div>
      </Dialog>

      {/* Orders Dialog */}
      <Dialog
        isOpen={showOrdersDialog}
        onClose={() => setShowOrdersDialog(false)}
        title="Your Orders"
        subtitle={`${tableName} ${sessionId ? `[#${getSessionCode(sessionId)}]` : ""}`}
        maxWidth="max-w-sm"
        rounded="rounded-md"
      >
        <div className="space-y-4 pt-1 max-h-[60vh] overflow-y-auto pr-1">
          {orders.length === 0 ? (
            <p className="text-center py-8 text-[13px] text-[#0A0A0F]/40 dark:text-zinc-500 font-medium">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-4 pb-2">
              {orders.map((order) => (
                <OrderStatusTracker key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
