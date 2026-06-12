import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "./OrderConfirmation.css";

const STATUS_TIMELINE = {
  pending: { label: "Order Placed", icon: "fa-check-circle", color: "#3b82f6" },
  preparing: { label: "Preparing", icon: "fa-fire-burner", color: "#f59e0b" },
  ready: { label: "Ready for Pickup", icon: "fa-bell", color: "#22c55e" },
  picked_up: { label: "Completed", icon: "fa-circle-check", color: "#6b7280" },
};

const STATUS_ORDER = ["pending", "preparing", "ready", "picked_up"];

function getStatusPosition(status) {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;
  const [liveOrder, setLiveOrder] = useState(order);
  const [syncError, setSyncError] = useState(null);

  // Poll for order status updates
  useEffect(() => {
    if (!order?._id) {
      console.error("[OrderConfirmation] No order ID available");
      return;
    }

    let pollAttempts = 0;
    let successCount = 0;

    const pollOrder = async () => {
      pollAttempts++;
      try {
        // Force fresh data with cache-busting timestamp
        const url = `/api/food/orders/${order._id}?t=${Date.now()}`;
        console.log(`[OrderConfirmation] Poll #${pollAttempts}: Fetching ${url}`);

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
          },
        });

        console.log(`[OrderConfirmation] Poll #${pollAttempts}: Got response status ${res.status}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`[OrderConfirmation] Poll #${pollAttempts} SUCCESS:`, {
            status: data.status,
            _id: data._id,
            updatedAt: data.updatedAt,
          });
          setLiveOrder(data);
          setSyncError(null);
          successCount++;
        } else {
          const errorText = await res.text();
          console.error(`[OrderConfirmation] Poll #${pollAttempts} HTTP ${res.status}:`, errorText);
          setSyncError(`Failed to sync: HTTP ${res.status}`);
        }
      } catch (err) {
        console.error(`[OrderConfirmation] Poll #${pollAttempts} EXCEPTION:`, err);
        setSyncError(`Sync error: ${err.message}`);
      }
    };

    // Initial fetch immediately
    console.log("[OrderConfirmation] Starting initial fetch");
    pollOrder();

    // Then poll every 2 seconds
    const pollInterval = setInterval(pollOrder, 2000);

    return () => {
      console.log(`[OrderConfirmation] Cleanup: ${successCount} successful polls out of ${pollAttempts} attempts`);
      clearInterval(pollInterval);
    };
  }, [order?._id]);

  const currentStatusPos = getStatusPosition(liveOrder.status);

  const subtotal = liveOrder.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  ) || 0;

  // Show error if no order data
  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <h2>No Order Found</h2>
          <p>We couldn't find your order. Please check your email or contact support.</p>
          <Link to="/menu" className="btn-primary">
            <i className="fa-solid fa-utensils"></i> Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      {/* Success Header */}
      <div className="confirmation-header">
        <div className="success-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for your order. Your delicious food is being prepared.
        </p>
      </div>

      {/* Order Number & Key Info */}
      <div className="confirmation-card">
        <div className="order-number-section">
          <div className="order-number">
            <span className="label">Order Number</span>
            <span className="number">#{liveOrder._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="order-time">
            <span className="label">Order Time</span>
            <span className="time">
              {new Date(liveOrder.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="confirmation-card">
        <h2 className="card-title">Order Status</h2>
        <div className="status-timeline">
          {["pending", "preparing", "ready", "picked_up"].map((status, idx) => {
            const config = STATUS_TIMELINE[status];
            const isCompleted = idx <= currentStatusPos;
            const isCurrent = idx === currentStatusPos;

            return (
              <div key={status} className={`timeline-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                <div className="timeline-dot" style={{ borderColor: isCompleted ? config.color : "#e5e7eb" }}>
                  <i
                    className={`fa-solid ${config.icon}`}
                    style={{ color: isCompleted ? config.color : "#9ca3af" }}
                  ></i>
                </div>
                <div className="timeline-content">
                  <span className="timeline-label">{config.label}</span>
                  {isCurrent && <span className="timeline-badge">In Progress</span>}
                  {isCompleted && idx < currentStatusPos && <span className="timeline-badge done">Done</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status Message */}
        {liveOrder.status === "ready" && (
          <div className="status-message ready">
            <i className="fa-solid fa-bell"></i>
            <div>
              <strong>Your order is ready!</strong>
              <p>Please come pick it up at 42W 46th Street, NY 10036</p>
            </div>
          </div>
        )}
        {liveOrder.status === "preparing" && (
          <div className="status-message preparing">
            <i className="fa-solid fa-fire-burner"></i>
            <div>
              <strong>We're preparing your order</strong>
              <p>Estimated time: 15-20 minutes</p>
            </div>
          </div>
        )}
        {liveOrder.status === "pending" && (
          <div className="status-message pending">
            <i className="fa-solid fa-hourglass-start"></i>
            <div>
              <strong>Order received</strong>
              <p>We'll start preparing your food shortly</p>
            </div>
          </div>
        )}
        {liveOrder.status === "picked_up" && (
          <div className="status-message picked-up">
            <i className="fa-solid fa-circle-check"></i>
            <div>
              <strong>Order completed</strong>
              <p>Thank you for your order! Enjoy your food!</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="confirmation-card">
        <h2 className="card-title">Order Summary</h2>
        <div className="order-summary">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {liveOrder.items?.map((item) => (
                <tr key={`${item.foodId}-${item.name}`}>
                  <td className="item-name">{item.name}</td>
                  <td className="item-qty">{item.qty}</td>
                  <td className="item-price">${(item.price || 0).toFixed(2)}</td>
                  <td className="item-total">${((item.price || 0) * (item.qty || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row highlight">
              <span>Total</span>
              <span>${(liveOrder.subtotal || subtotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {liveOrder.note && (
          <div className="order-note">
            <strong>Special Instructions:</strong>
            <p>{liveOrder.note}</p>
          </div>
        )}
      </div>

      {/* Pickup Information */}
      <div className="confirmation-card">
        <h2 className="card-title">Pickup Information</h2>
        <div className="pickup-info">
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
      <div className="confirmation-actions">
        <Link to="/my-orders" className="btn-primary">
          <i className="fa-solid fa-receipt"></i> View All Orders
        </Link>
        <Link to="/menu" className="btn-secondary">
          <i className="fa-solid fa-utensils"></i> Order More
        </Link>
      </div>

      {/* Sync Status */}
      {syncError && (
        <div className="sync-error-notice">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{syncError}</span>
          <button type="button" onClick={() => window.location.reload()} className="sync-refresh-btn">
            Refresh Page
          </button>
        </div>
      )}

      {/* Auto-refresh notice */}
      <div className="auto-refresh-notice">
        <i className="fa-solid fa-sync"></i>
        {syncError ? "Sync failed - Check console or refresh page" : "Live status updates (every 2 seconds)"}
      </div>
    </div>
  );
}
