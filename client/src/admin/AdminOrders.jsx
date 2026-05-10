import React, { useState, useEffect } from "react";

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = (status = filter) => {
    setLoading(true);
    fetch(`/api/admin/orders?status=${status}&limit=50`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

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
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
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
                  <span style={{ fontWeight: 700 }}>${order.subtotal.toFixed(2)}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <i className={`fa-solid fa-chevron-${expandedId === order._id ? "up" : "down"}`}
                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}></i>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === order._id && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {/* Items */}
                  <div style={{ padding: "14px 20px" }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {item.imageUrl && <img src={item.imageUrl} alt="" className="item-thumb-sm" />}
                              {item.name}
                            </td>
                            <td>{item.qty}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {order.note && (
                    <div style={{ padding: "0 20px 10px", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                      <strong>Customer note:</strong> {order.note}
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
