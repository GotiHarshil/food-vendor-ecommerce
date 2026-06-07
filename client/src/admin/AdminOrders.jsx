import React, { useState, useEffect, useCallback } from "react";

const STATUSES = ["all", "pending", "preparing", "ready", "picked_up", "cancelled"];
const STATUS_LABELS = {
  all: "All",
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

const NEXT_STATUS = {
  pending: "preparing",
  preparing: "ready",
  ready: "picked_up",
};

export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [translating, setTranslating] = useState(null);
  const [itemTranslations, setItemTranslations] = useState({});

  const fetchOrders = useCallback(() => {
    fetch("/api/admin/orders?limit=100", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAllOrders(data.orders || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Always load orders immediately via regular HTTP
    fetchOrders();

    let esInstance = null;

    // Check if user is authenticated and is admin
    const sseBase = import.meta.env.DEV ? "http://localhost:5000" : "";

    // First, verify authentication status
    fetch(`${sseBase}/api/admin/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("[AdminOrders] Auth check:", data);
        if (!data.authenticated || data.role !== "admin") {
          console.error("[AdminOrders] User is not authenticated as admin");
          setConnected(false);
          return;
        }

        // User is authenticated, try SSE connection
        const sseUrl = `${sseBase}/api/admin/orders/stream`;
        console.log(`[AdminOrders] Connecting to SSE: ${sseUrl}`);

        esInstance = new EventSource(sseUrl, {
          withCredentials: true,
        });

        esInstance.onopen = () => {
          console.log("[AdminOrders] SSE connection opened");
          setConnected(true);
        };

        esInstance.onmessage = (e) => {
          try {
            if (e.data.startsWith(":")) {
              // Ignore ping messages
              return;
            }
            const orders = JSON.parse(e.data);
            console.log("[AdminOrders] Received SSE message with", orders.length, "orders");
            setAllOrders(orders);
            setLoading(false);
          } catch (err) {
            console.error("[AdminOrders] Error parsing SSE message:", err);
          }
        };

        esInstance.onerror = (err) => {
          console.error("[AdminOrders] SSE connection error:", err);
          console.error("[AdminOrders] EventSource readyState:", esInstance.readyState);
          setConnected(false);
        };
      })
      .catch((err) => {
        console.error("[AdminOrders] Error checking auth:", err);
        setConnected(false);
      });

    // Fallback: Poll for orders every 5 seconds if SSE is not connected
    const pollInterval = setInterval(() => {
      if (!connected) {
        console.log("[AdminOrders] Polling for orders (SSE not connected)");
        fetchOrders();
      }
    }, 5000);

    return () => {
      console.log("[AdminOrders] Cleaning up SSE and poll interval");
      if (esInstance) {
        esInstance.close();
      }
      clearInterval(pollInterval);
    };
  }, [fetchOrders, connected]);

  const orders = filter === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === filter);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTranslate = async (orderId) => {
    setTranslating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/translate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAllOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, noteHindi: data.noteHindi } : o)
        );
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslating(null);
    }
  };

  const handleTranslateItemNote = async (orderId, itemIndex, itemNote) => {
    const translationKey = `${orderId}-${itemIndex}`;
    setTranslating(translationKey);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/translate-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex, note: itemNote }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setItemTranslations((prev) => ({
          ...prev,
          [translationKey]: data.noteHindi
        }));
      }
    } catch (err) {
      console.error("Item translation failed:", err);
    } finally {
      setTranslating(null);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
        credentials: "include",
      });
      if (res.ok) {
        setCancellingId(null);
        setCancelReason("");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1><i className="fa-solid fa-receipt"></i> Orders</h1>
        <span
          title={connected ? "Live updates active" : "Reconnecting…"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "0.78rem", fontWeight: 600,
            color: connected ? "var(--success, #22c55e)" : "var(--text-muted)",
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: connected ? "var(--success, #22c55e)" : "var(--text-muted)",
            display: "inline-block",
          }} />
          {connected ? "Live" : "Reconnecting…"}
        </span>
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ marginBottom: "20px" }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`admin-filter-btn${filter === s ? " active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner"></div></div>
      ) : orders.length === 0 ? (
        <div className="admin-table-wrap" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          No orders found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((order) => (
            <div key={order._id} className="admin-table-wrap">
              {/* Order header row */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", cursor: "pointer", flexWrap: "wrap", gap: "12px",
                }}
                onClick={() => toggleExpand(order._id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700 }}>#{order._id.slice(-6).toUpperCase()}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {order.customerName} &middot; {order.customerEmail}
                  </span>
                  <span className={`status-pill status-${order.status}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: 700 }}>${order.subtotal?.toFixed(2) ?? "0.00"}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <i className={`fa-solid fa-chevron-${expandedIds.has(order._id) ? "up" : "down"}`}
                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}></i>
                </div>
              </div>

              {/* Expanded details */}
              {expandedIds.has(order._id) && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {/* Items */}
                  <div style={{ padding: "14px 20px" }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <React.Fragment key={i}>
                            <tr>
                              <td style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                                {item.imageUrl && <img src={item.imageUrl} alt="" className="item-thumb-sm" />}
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  {item.name}
                                  {item.note && (
                                    <span style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      fontSize: "0.7rem",
                                      fontWeight: 600,
                                      whiteSpace: "nowrap"
                                    }} title={`Note: ${item.note}`}>
                                      <i className="fa-solid fa-sticky-note"></i>
                                      Special
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>{item.qty}</td>
                              <td>${item.price?.toFixed(2) ?? "0.00"}</td>
                              <td style={{ fontWeight: 600 }}>${((item.price ?? 0) * item.qty).toFixed(2)}</td>
                            </tr>
                            {item.note && (
                              <tr className="admin-item-note-row">
                                <td colSpan="4" style={{ padding: "8px 20px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                      <i className="fa-solid fa-sticky-note" style={{ color: "var(--primary)", marginRight: "6px" }}></i>
                                      <strong>Note:</strong> {item.note}
                                    </div>
                                    {itemTranslations[`${order._id}-${i}`] ? (
                                      <div style={{
                                        fontSize: "0.92rem", background: "#f0f4ff", padding: "10px 14px",
                                        borderRadius: "8px", borderLeft: "3px solid #4f46e5",
                                        color: "#1a1a2e", fontFamily: "sans-serif",
                                      }}>
                                        <strong style={{ color: "#4f46e5" }}>हिंदी:</strong> {itemTranslations[`${order._id}-${i}`]}
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleTranslateItemNote(order._id, i, item.note)}
                                        disabled={translating === `${order._id}-${i}`}
                                        style={{
                                          padding: "6px 14px", fontSize: "0.82rem", fontWeight: 600,
                                          background: translating === `${order._id}-${i}` ? "#a5b4fc" : "#4f46e5",
                                          color: "white", border: "none", borderRadius: "6px",
                                          cursor: translating === `${order._id}-${i}` ? "not-allowed" : "pointer",
                                          display: "inline-flex", alignItems: "center", gap: "6px",
                                          transition: "background 0.2s",
                                          width: "fit-content"
                                        }}
                                      >
                                        <i className="fa-solid fa-language"></i>
                                        {translating === `${order._id}-${i}` ? "Translating..." : "Translate to Hindi"}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {order.note && (
                    <div style={{ padding: "0 20px 14px" }}>
                      <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        <strong>Customer note:</strong> {order.note}
                      </div>
                      {order.noteHindi ? (
                        <div style={{
                          fontSize: "0.92rem", background: "#f0f4ff", padding: "10px 14px",
                          borderRadius: "8px", borderLeft: "3px solid #4f46e5",
                          color: "#1a1a2e", fontFamily: "sans-serif",
                        }}>
                          <strong style={{ color: "#4f46e5" }}>हिंदी:</strong> {order.noteHindi}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTranslate(order._id)}
                          disabled={translating === order._id}
                          style={{
                            padding: "6px 14px", fontSize: "0.82rem", fontWeight: 600,
                            background: translating === order._id ? "#a5b4fc" : "#4f46e5",
                            color: "white", border: "none", borderRadius: "6px",
                            cursor: translating === order._id ? "not-allowed" : "pointer",
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            transition: "background 0.2s",
                          }}
                        >
                          <i className="fa-solid fa-language"></i>
                          {translating === order._id ? "Translating..." : "Translate to Hindi"}
                        </button>
                      )}
                    </div>
                  )}

                  {order.adminNote && (
                    <div style={{ padding: "0 20px 10px", fontSize: "0.88rem", color: "var(--error)" }}>
                      <strong>Admin note:</strong> {order.adminNote}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    padding: "14px 20px", borderTop: "1px solid var(--border)",
                    display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
                  }}>
                    {NEXT_STATUS[order.status] && (
                      <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                      >
                        <i className="fa-solid fa-arrow-right"></i>
                        Mark as {STATUS_LABELS[NEXT_STATUS[order.status]]}
                      </button>
                    )}

                    {order.status !== "cancelled" && order.status !== "picked_up" && (
                      cancellingId === order._id ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}>
                          <input
                            className="admin-input"
                            placeholder="Reason for cancellation..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            style={{ maxWidth: "300px" }}
                          />
                          <button className="admin-btn admin-btn-danger" onClick={() => handleCancel(order._id)}>
                            Confirm Cancel
                          </button>
                          <button className="admin-btn admin-btn-secondary" onClick={() => setCancellingId(null)}>
                            Nevermind
                          </button>
                        </div>
                      ) : (
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => setCancellingId(order._id)}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel Order
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
