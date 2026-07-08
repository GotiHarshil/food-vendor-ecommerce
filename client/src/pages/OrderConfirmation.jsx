import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [liveOrder, setLiveOrder] = useState(null);
  const [loadError, setLoadError] = useState(null); // fatal: never resolved an order
  const [syncError, setSyncError] = useState(null); // non-fatal: a later poll failed

  // Resolve the order from the Stripe session_id, then poll it for live status.
  useEffect(() => {
    if (!sessionId) {
      console.error("[OrderConfirmation] No session_id in URL");
      setLoadError("We couldn't find your order. Please check your email or contact support.");
      return;
    }

    let cancelled = false;
    let pollInterval;
    let pollAttempts = 0;

    const pollOrder = async (orderId) => {
      pollAttempts++;
      try {
        // Force fresh data with cache-busting timestamp
        const url = `/api/food/orders/${orderId}?t=${Date.now()}`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
          },
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setLiveOrder(data);
          setSyncError(null);
        } else {
          console.error(`[OrderConfirmation] Poll #${pollAttempts} HTTP ${res.status}`);
          setSyncError(`Failed to sync: HTTP ${res.status}`);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`[OrderConfirmation] Poll #${pollAttempts} EXCEPTION:`, err);
          setSyncError(`Sync error: ${err.message}`);
        }
      }
    };

    // The order is created synchronously when the Stripe Checkout session is created
    // (before the customer even leaves for Stripe), so this should resolve on the
    // first try — the small retry budget below just covers a transient blip.
    const resolveOrder = async (attempt = 1) => {
      try {
        const res = await fetch(`/api/food/checkout/session/${sessionId}`, { credentials: "include" });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setLiveOrder(data);
          pollOrder(data._id);
          pollInterval = setInterval(() => pollOrder(data._id), 2000);
        } else if (attempt < 5) {
          setTimeout(() => resolveOrder(attempt + 1), 1000);
        } else {
          setLoadError("We couldn't find your order. Please check your email or contact support.");
        }
      } catch (err) {
        if (cancelled) return;
        if (attempt < 5) {
          setTimeout(() => resolveOrder(attempt + 1), 1000);
        } else {
          console.error("[OrderConfirmation] Failed to resolve order from session:", err);
          setLoadError("We couldn't find your order. Please check your email or contact support.");
        }
      }
    };

    resolveOrder();

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId]);

  if (loadError) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <h2>No Order Found</h2>
          <p>{loadError}</p>
          <Link to="/menu" className="btn-primary">
            <i className="fa-solid fa-utensils"></i> Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  if (!liveOrder) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-header">
          <div className="success-icon">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          </div>
          <h1>Confirming your order...</h1>
          <p className="confirmation-subtitle">Just a moment while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  const currentStatusPos = getStatusPosition(liveOrder.status);

  const subtotal = liveOrder.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  ) || 0;

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
        {liveOrder.paymentStatus === "unpaid" && (
          <div className="status-message pending">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <div>
              <strong>Confirming your payment...</strong>
              <p>This usually takes just a few seconds.</p>
            </div>
          </div>
        )}
        {liveOrder.paymentStatus !== "unpaid" && liveOrder.status === "ready" && (
          <div className="status-message ready">
            <i className="fa-solid fa-bell"></i>
            <div>
              <strong>Your order is ready!</strong>
              <p>Please come pick it up at 42W 46th Street, NY 10036</p>
            </div>
          </div>
        )}
        {liveOrder.paymentStatus !== "unpaid" && liveOrder.status === "preparing" && (
          <div className="status-message preparing">
            <i className="fa-solid fa-fire-burner"></i>
            <div>
              <strong>We're preparing your order</strong>
              <p>Estimated time: 15-20 minutes</p>
            </div>
          </div>
        )}
        {liveOrder.paymentStatus !== "unpaid" && liveOrder.status === "pending" && (
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
