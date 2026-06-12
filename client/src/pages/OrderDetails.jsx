import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./OrderDetails.css";

const STATUS_TIMELINE = {
  pending: { label: "Order Placed", icon: "fa-check-circle", color: "#3b82f6" },
  preparing: { label: "Preparing", icon: "fa-fire-burner", color: "#f59e0b" },
  ready: { label: "Ready for Pickup", icon: "fa-bell", color: "#22c55e" },
  picked_up: { label: "Completed", icon: "fa-circle-check", color: "#6b7280" },
  cancelled: { label: "Cancelled", icon: "fa-circle-xmark", color: "#ef4444" },
};

const STATUS_ORDER = ["pending", "preparing", "ready", "picked_up"];

function getStatusPosition(status) {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/food/orders/${orderId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError("Order not found");
          } else if (res.status === 403) {
            setError("You don't have permission to view this order");
          } else {
            setError("Failed to load order");
          }
          return;
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error loading order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          <div className="cart-loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <h2>Unable to Load Order</h2>
          <p>{error || "Order not found"}</p>
          <Link to="/my-orders" className="btn-primary">
            <i className="fa-solid fa-arrow-left"></i> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusPos = getStatusPosition(order.status);
  const subtotal = order.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  ) || 0;

  const config = STATUS_TIMELINE[order.status] || STATUS_TIMELINE.pending;

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <button className="btn-back" onClick={() => navigate("/my-orders")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Order Details</h1>
      </div>

      {/* Order Status Card */}
      <div className="details-card">
        <div className="order-status-section">
          <div className="status-badge" style={{ background: config.color + "20", color: config.color }}>
            <i className={`fa-solid ${config.icon}`}></i>
            <div>
              <p className="status-label">{config.label}</p>
              <p className="status-time">
                {new Date(order.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-section">
          <div className="timeline">
            {["pending", "preparing", "ready", "picked_up"].map((status, idx) => {
              const statusConfig = STATUS_TIMELINE[status];
              const isCompleted = idx <= currentStatusPos;
              const isCurrent = idx === currentStatusPos;

              return (
                <div
                  key={status}
                  className={`timeline-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                >
                  <div
                    className="timeline-dot"
                    style={{
                      borderColor: isCompleted ? statusConfig.color : "#e5e7eb",
                      background: isCompleted ? statusConfig.color : "white",
                    }}
                  >
                    <i
                      className={`fa-solid ${statusConfig.icon}`}
                      style={{ color: isCompleted ? "white" : "#9ca3af" }}
                    ></i>
                  </div>
                  <div className="timeline-label">{statusConfig.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {order.status === "ready" && (
          <div className="status-message ready">
            <i className="fa-solid fa-bell"></i>
            <div>
              <strong>Your order is ready!</strong>
              <p>Please come pick it up at 42W 46th Street, NY 10036</p>
            </div>
          </div>
        )}
        {order.status === "preparing" && (
          <div className="status-message preparing">
            <i className="fa-solid fa-fire-burner"></i>
            <div>
              <strong>We're preparing your order</strong>
              <p>Estimated time: 15-20 minutes</p>
            </div>
          </div>
        )}
        {order.status === "pending" && (
          <div className="status-message pending">
            <i className="fa-solid fa-hourglass-start"></i>
            <div>
              <strong>Order received</strong>
              <p>We'll start preparing your food shortly</p>
            </div>
          </div>
        )}
        {order.status === "picked_up" && (
          <div className="status-message picked-up">
            <i className="fa-solid fa-circle-check"></i>
            <div>
              <strong>Order completed</strong>
              <p>Thank you for your order! Enjoy your food!</p>
            </div>
          </div>
        )}
        {order.status === "cancelled" && (
          <div className="status-message cancelled">
            <i className="fa-solid fa-circle-xmark"></i>
            <div>
              <strong>Order cancelled</strong>
              {order.adminNote && <p>{order.adminNote}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="details-card">
        <h2 className="card-title">Order Summary</h2>
        <div className="items-list">
          {order.items?.map((item) => (
            <div key={`${item.foodId}-${item.name}`} className="item-row">
              <div className="item-info">
                <img src={item.imageUrl} alt={item.name} className="item-img" />
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Qty: {item.qty}</p>
                </div>
              </div>
              <span className="item-price">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="summary-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row highlight">
            <span>Total</span>
            <span>${(order.subtotal || subtotal).toFixed(2)}</span>
          </div>
        </div>

        {order.note && (
          <div className="order-note">
            <strong>Special Instructions:</strong>
            <p>{order.note}</p>
          </div>
        )}
      </div>

      {/* Pickup Info */}
      <div className="details-card">
        <h2 className="card-title">Pickup Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <i className="fa-solid fa-location-dot"></i>
            <div>
              <span className="info-label">Location</span>
              <span className="info-value">42W 46th Street, NY 10036</span>
            </div>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-phone"></i>
            <div>
              <span className="info-label">Contact</span>
              <span className="info-value">(212) 555-0123</span>
            </div>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-clock"></i>
            <div>
              <span className="info-label">Hours</span>
              <span className="info-value">11:00 AM - 11:00 PM Daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="details-actions">
        <Link to="/my-orders" className="btn-primary">
          <i className="fa-solid fa-arrow-left"></i> Back to Orders
        </Link>
        <Link to="/menu" className="btn-secondary">
          <i className="fa-solid fa-utensils"></i> Order More
        </Link>
      </div>
    </div>
  );
}
