import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MyOrders.css";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b", bg: "#fef3c7", icon: "fa-clock" },
  preparing: { label: "Preparing", color: "#3b82f6", bg: "#dbeafe", icon: "fa-fire-burner" },
  ready: { label: "Ready for Pickup", color: "#22c55e", bg: "#dcfce7", icon: "fa-bell" },
  picked_up: { label: "Picked Up", color: "#6b7280", bg: "#f3f4f6", icon: "fa-circle-check" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fef2f2", icon: "fa-circle-xmark" },
};

const PAYMENT_BADGE = {
  refund_pending: { label: "Refund processing", color: "#b45309", bg: "#fef3c7" },
  refunded: { label: "Refunded", color: "#374151", bg: "#f3f4f6" },
  payment_failed: { label: "Payment failed", color: "#b91c1c", bg: "#fef2f2" },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // order card showing the reason input
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/food/my-orders?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders().then(() => setLoading(false));

    // Poll every 3 seconds for updates
    const pollInterval = setInterval(fetchOrders, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const handleCancel = async (orderId) => {
    setCancelSubmitting(true);
    setCancelError("");
    try {
      const res = await fetch(`/api/food/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCancellingId(null);
        setCancelReason("");
        fetchOrders();
      } else {
        setCancelError(data.error || "Could not cancel this order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      setCancelError("Network error. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="cart-loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => ["pending", "preparing", "ready"].includes(o.status)
  ).length;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1><i className="fa-solid fa-receipt"></i> My Orders</h1>
      </div>

      <div className="orders-sync-notice">
        <i className="fa-solid fa-sync"></i>
        <span>Live status updates (every 3 seconds)</span>
      </div>

      {activeOrders >= 2 && (
        <div className="active-orders-warning">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <div className="warning-content">
            <strong>Maximum Active Orders Reached</strong>
            <p>You have {activeOrders} active orders. Complete or pick up one before placing a new order.</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">
            <i className="fa-solid fa-receipt"></i>
          </div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here once you place your first order.</p>
          <Link to="/menu" className="btn-shop-now">
            <i className="fa-solid fa-utensils"></i> Browse Menu
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <div key={order._id} className="order-card">
                <div className="order-top">
                  <div className="order-meta">
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span
                    className="order-status"
                    style={{ background: config.bg, color: config.color }}
                  >
                    <i className={`fa-solid ${config.icon}`}></i>
                    {config.label}
                  </span>
                </div>

                {PAYMENT_BADGE[order.paymentStatus] && (
                  <div style={{ padding: "0 4px 8px" }}>
                    <span
                      className="order-status"
                      style={{
                        background: PAYMENT_BADGE[order.paymentStatus].bg,
                        color: PAYMENT_BADGE[order.paymentStatus].color,
                      }}
                    >
                      {PAYMENT_BADGE[order.paymentStatus].label}
                    </span>
                  </div>
                )}

                {order.status === "ready" && (
                  <div className="ready-notice">
                    <i className="fa-solid fa-bell"></i>
                    Your order is ready! Please pick it up at <strong>42W 46th Street, NY 10036</strong>
                  </div>
                )}

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={`${item.foodId}-${item.name}`} className="order-item">
                      <div className="oi-thumb">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="oi-info">
                        <span className="oi-name">{item.name}</span>
                        <span className="oi-qty">x{item.qty}</span>
                        {item.note && (
                          <span className="oi-note">
                            <i className="fa-solid fa-sticky-note"></i> {item.note}
                          </span>
                        )}
                      </div>
                      <span className="oi-price">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-bottom">
                  {order.note && (
                    <div className="order-note">
                      <i className="fa-solid fa-message"></i> {order.note}
                    </div>
                  )}
                  {order.cancelReason && order.status === "cancelled" && (
                    <div className="order-admin-note">
                      <i className="fa-solid fa-circle-info"></i> {order.cancelReason}
                    </div>
                  )}
                  <div className="order-total">
                    <span>Total</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    style={{ display: "inline-block", marginTop: "10px", fontSize: "0.9rem" }}
                  >
                    {order.status === "picked_up" ? "View Details & Rate" : "View Details"}
                    {" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>

                  {order.status === "pending" && (
                    cancellingId === order._id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                        <input
                          type="text"
                          placeholder="Reason for cancelling (optional)"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          maxLength="500"
                          style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border, #e5e7eb)" }}
                        />
                        {cancelError && (
                          <span style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{cancelError}</span>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-retry"
                            disabled={cancelSubmitting}
                            onClick={() => handleCancel(order._id)}
                          >
                            {cancelSubmitting ? "Cancelling..." : "Confirm Cancel"}
                          </button>
                          <button
                            type="button"
                            className="btn-retry"
                            disabled={cancelSubmitting}
                            onClick={() => { setCancellingId(null); setCancelReason(""); setCancelError(""); }}
                          >
                            Nevermind
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-retry"
                        style={{ marginTop: "10px" }}
                        onClick={() => { setCancellingId(order._id); setCancelReason(""); setCancelError(""); }}
                      >
                        <i className="fa-solid fa-xmark"></i> Cancel Order
                      </button>
                    )
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
