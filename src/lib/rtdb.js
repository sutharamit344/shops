/**
 * Firebase Realtime Database helpers for QR Table Ordering
 * Paths:
 *   qr_tables/{shopId}/{tableId}
 *   qr_sessions/{shopId}/{sessionKey}
 *   qr_orders/{shopId}/{sessionId}/{orderId}
 */

import { rtdb } from "./firebase";
import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
} from "firebase/database";

// ─── TABLE MANAGEMENT ────────────────────────────────────────────

/** Fetch all tables for a shop (once) */
export async function getTables(shopId) {
  const snap = await get(ref(rtdb, `qr_tables/${shopId}`));
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

/** Add a new table */
export async function addTable(shopId, { name, capacity = 4, shape = "round" }) {
  const tableRef = push(ref(rtdb, `qr_tables/${shopId}`));
  await set(tableRef, {
    name,
    capacity,
    shape,
    active: true,
    currentSessionId: null,
    createdAt: Date.now(),
  });
  return tableRef.key;
}

/** Update a table */
export async function updateTable(shopId, tableId, data) {
  await update(ref(rtdb, `qr_tables/${shopId}/${tableId}`), data);
}

/** Delete a table */
export async function deleteTable(shopId, tableId) {
  await remove(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
}

/** Listen to all tables in realtime */
export function listenTables(shopId, callback) {
  const r = ref(rtdb, `qr_tables/${shopId}`);
  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    callback(Object.entries(data).map(([id, val]) => ({ id, ...val })));
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

/** Fetch a single table's data */
export async function getTable(shopId, tableId) {
  const snap = await get(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
  if (!snap.exists()) return null;
  return { id: snap.key, ...snap.val() };
}

/** Merge a source table into a target table */
export async function mergeTables(shopId, sourceTableId, targetTableId) {
  await update(ref(rtdb, `qr_tables/${shopId}/${sourceTableId}`), {
    mergedInto: targetTableId,
  });
  // If target table has an active session, point source table's currentSessionId to it
  const targetSnap = await get(ref(rtdb, `qr_tables/${shopId}/${targetTableId}/currentSessionId`));
  if (targetSnap.exists() && targetSnap.val()) {
    await set(ref(rtdb, `qr_tables/${shopId}/${sourceTableId}/currentSessionId`), targetSnap.val());
  }
}

/** Unmerge a table */
export async function unmergeTable(shopId, tableId) {
  await update(ref(rtdb, `qr_tables/${shopId}/${tableId}`), {
    mergedInto: null,
    currentSessionId: null,
  });
}

// ─── SESSION MANAGEMENT ───────────────────────────────────────────

/** Fetch clean table name */
export async function getTableName(shopId, tableId) {
  const snap = await get(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
  if (!snap.exists()) return `Table ${tableId}`;
  return snap.val().name || `Table ${tableId}`;
}

/**
 * Create a new session for a table.
 * Returns the sessionId.
 */
export async function createSession(shopId, tableId, tableName, requireApproval, customerName = "", customerPhone = "", customerId = "") {
  const sessRef = push(ref(rtdb, `qr_sessions/${shopId}`));
  const sessionId = sessRef.key;

  const creatorId = customerId || "creator_" + Math.random().toString(36).substring(2, 11);
  const guests = {};
  if (customerName) {
    guests[creatorId] = {
      name: customerName,
      phone: customerPhone,
      joinedAt: Date.now()
    };
  }

  await set(sessRef, {
    tableId,
    tableName,
    sessionId,
    customerName,
    customerPhone,
    guests,
    status: requireApproval ? "pending" : "active",
    createdAt: Date.now(),
  });

  // Resolve the leader and group tables to update currentSessionId for all of them
  try {
    const tableSnap = await get(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
    const tableVal = tableSnap.val();
    const leaderId = (tableVal && tableVal.mergedInto) ? tableVal.mergedInto : tableId;

    const tablesSnap = await get(ref(rtdb, `qr_tables/${shopId}`));
    const updates = {};
    
    if (tablesSnap.exists()) {
      const allTables = tablesSnap.val();
      Object.keys(allTables).forEach((tId) => {
        const t = allTables[tId];
        const tLeaderId = t.mergedInto || tId;
        if (tLeaderId === leaderId) {
          updates[`${tId}/currentSessionId`] = sessionId;
        }
      });
    } else {
      updates[`${tableId}/currentSessionId`] = sessionId;
    }

    await update(ref(rtdb, `qr_tables/${shopId}`), updates);
  } catch (err) {
    console.error("Error setting currentSessionId for group: ", err);
    // Fallback to single table
    await set(ref(rtdb, `qr_tables/${shopId}/${tableId}/currentSessionId`), sessionId);
  }
  
  return sessionId;
}

/** Join an existing session by adding a guest */
export async function joinSession(shopId, sessionId, customerName, customerPhone, customerId) {
  if (!customerId || !sessionId) return;
  const guestRef = ref(rtdb, `qr_sessions/${shopId}/${sessionId}/guests/${customerId}`);
  await set(guestRef, {
    name: customerName,
    phone: customerPhone,
    joinedAt: Date.now()
  });
}

/** Get a session snapshot (once) */
export async function getSession(shopId, sessionId) {
  const snap = await get(ref(rtdb, `qr_sessions/${shopId}/${sessionId}`));
  if (!snap.exists()) return null;
  return { id: snap.key, ...snap.val() };
}

/** Listen to a single session in realtime */
export function listenSession(shopId, sessionId, callback) {
  const r = ref(rtdb, `qr_sessions/${shopId}/${sessionId}`);
  const handler = (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.key, ...snap.val() });
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

/** Update session status */
export async function updateSessionStatus(shopId, sessionId, status) {
  await update(ref(rtdb, `qr_sessions/${shopId}/${sessionId}`), { status });
}

/** Approve a session and set as currentSessionId for table group */
export async function approveSession(shopId, sessionId, tableId) {
  // 1. Update session status
  await update(ref(rtdb, `qr_sessions/${shopId}/${sessionId}`), { status: "active" });

  // 2. Point all tables in the merge group to this session
  try {
    const tableSnap = await get(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
    const tableVal = tableSnap.val();
    const leaderId = (tableVal && tableVal.mergedInto) ? tableVal.mergedInto : tableId;

    const tablesSnap = await get(ref(rtdb, `qr_tables/${shopId}`));
    const updates = {};
    
    if (tablesSnap.exists()) {
      const allTables = tablesSnap.val();
      Object.keys(allTables).forEach((tId) => {
        const t = allTables[tId];
        const tLeaderId = t.mergedInto || tId;
        if (tLeaderId === leaderId) {
          updates[`${tId}/currentSessionId`] = sessionId;
        }
      });
    } else {
      updates[`${tableId}/currentSessionId`] = sessionId;
    }

    await update(ref(rtdb, `qr_tables/${shopId}`), updates);
  } catch (err) {
    console.error("Error setting currentSessionId on approval: ", err);
    await set(ref(rtdb, `qr_tables/${shopId}/${tableId}/currentSessionId`), sessionId);
  }
}

/** Close a session and reset table */
export async function closeSession(shopId, sessionId, tableId) {
  let isPending = false;
  try {
    const sessionSnap = await get(ref(rtdb, `qr_sessions/${shopId}/${sessionId}`));
    if (sessionSnap.exists()) {
      const sVal = sessionSnap.val();
      isPending = sVal && sVal.status === "pending";
    }
  } catch (e) {
    console.error("Error checking session status before close:", e);
  }

  await update(ref(rtdb, `qr_sessions/${shopId}/${sessionId}`), {
    status: isPending ? "rejected" : "closed",
    closedAt: Date.now(),
  });

  // Resolve next active session for the table group
  let nextSessionId = null;
  try {
    const tableSnap = await get(ref(rtdb, `qr_tables/${shopId}/${tableId}`));
    const tableVal = tableSnap.val();
    const leaderId = (tableVal && tableVal.mergedInto) ? tableVal.mergedInto : tableId;

    const sessionsSnap = await get(ref(rtdb, `qr_sessions/${shopId}`));
    const tablesSnap = await get(ref(rtdb, `qr_tables/${shopId}`));
    
    if (sessionsSnap.exists() && tablesSnap.exists()) {
      const allSessions = sessionsSnap.val();
      const allTables = tablesSnap.val();
      
      // Find any active/pending session belonging to any table in this merge group
      const otherActive = Object.values(allSessions).find((s) => {
        if (s.sessionId === sessionId || (s.status !== "active" && s.status !== "pending")) return false;
        const sTable = allTables[s.tableId];
        const sTableLeaderId = (sTable && sTable.mergedInto) ? sTable.mergedInto : s.tableId;
        return sTableLeaderId === leaderId;
      });

      if (otherActive) {
        nextSessionId = otherActive.sessionId;
      }
    }

    // Update all tables in the group
    const updates = {};
    if (tablesSnap.exists()) {
      const allTables = tablesSnap.val();
      Object.keys(allTables).forEach((tId) => {
        const t = allTables[tId];
        const tLeaderId = t.mergedInto || tId;
        if (tLeaderId === leaderId) {
          updates[`${tId}/currentSessionId`] = nextSessionId;
        }
      });
    } else {
      updates[`${tableId}/currentSessionId`] = nextSessionId;
    }

    await update(ref(rtdb, `qr_tables/${shopId}`), updates);
  } catch (err) {
    console.error("Error updating group session reference on close: ", err);
    await set(ref(rtdb, `qr_tables/${shopId}/${tableId}/currentSessionId`), null);
  }
}

/** Listen to all sessions for admin (pending + active) */
export function listenSessions(shopId, callback) {
  const r = ref(rtdb, `qr_sessions/${shopId}`);
  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    callback(Object.entries(data).map(([id, val]) => ({ id, ...val })));
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

// ─── ORDER MANAGEMENT ─────────────────────────────────────────────

/**
 * Place a new order under a session.
 * Returns the orderId.
 */
export async function placeOrder(shopId, sessionId, tableId, tableName, items, note = "") {
  const orderRef = push(ref(rtdb, `qr_orders/${shopId}/${sessionId}`));
  await set(orderRef, {
    items,           // [{ name, price, qty, unit }]
    status: "placed",
    note,
    tableId,
    tableName,
    placedAt: Date.now(),
  });
  return orderRef.key;
}

/** Update order status */
export async function updateOrderStatus(shopId, sessionId, orderId, status) {
  await update(ref(rtdb, `qr_orders/${shopId}/${sessionId}/${orderId}`), {
    status,
    [`${status}At`]: Date.now(),
  });
}

/** Update status of a specific item in an order */
export async function updateOrderItemStatus(shopId, sessionId, orderId, itemIndex, status) {
  const itemRef = ref(rtdb, `qr_orders/${shopId}/${sessionId}/${orderId}/items/${itemIndex}`);
  await update(itemRef, { status });

  // Sync parent order's overall status based on all item statuses
  const orderRef = ref(rtdb, `qr_orders/${shopId}/${sessionId}/${orderId}`);
  const snap = await get(orderRef);
  if (snap.exists()) {
    const order = snap.val();
    if (order.items && order.items.length > 0) {
      const itemStatuses = order.items.map((item, idx) => 
        idx === itemIndex ? status : (item.status || "placed")
      );
      
      const nonCancelled = itemStatuses.filter(s => s !== "cancelled");
      if (nonCancelled.length === 0) {
        // All items cancelled
        await update(orderRef, { status: "cancelled", cancelledAt: Date.now() });
      } else {
        if (nonCancelled.every(s => s === "served")) {
          await update(orderRef, { status: "served", servedAt: Date.now() });
        } else if (nonCancelled.every(s => s === "ready" || s === "served")) {
          await update(orderRef, { status: "ready", readyAt: Date.now() });
        } else if (nonCancelled.some(s => s === "preparing" || s === "ready" || s === "served")) {
          await update(orderRef, { status: "preparing", preparingAt: Date.now() });
        } else if (nonCancelled.some(s => s === "confirmed")) {
          await update(orderRef, { status: "confirmed", confirmedAt: Date.now() });
        } else {
          await update(orderRef, { status: "placed" });
        }
      }
    }
  }
}

/** Listen to all orders for a session */
export function listenSessionOrders(shopId, sessionId, callback) {
  const r = ref(rtdb, `qr_orders/${shopId}/${sessionId}`);
  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    callback(Object.entries(data).map(([id, val]) => ({ id, ...val })));
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

/** Listen to ALL orders across all sessions (kitchen view) */
export function listenAllOrders(shopId, callback) {
  const r = ref(rtdb, `qr_orders/${shopId}`);
  const handler = (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val();
    // Flatten all sessions into a single list with sessionId attached
    const allOrders = [];
    Object.entries(data).forEach(([sessionId, orders]) => {
      Object.entries(orders).forEach(([orderId, order]) => {
        allOrders.push({ id: orderId, sessionId, ...order });
      });
    });
    callback(allOrders);
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}
