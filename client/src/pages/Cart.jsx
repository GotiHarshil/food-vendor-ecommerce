import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qtyInputs, setQtyInputs] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/status", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch { /* ignore */ }
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/food/cart", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
        const inputs = {};
        data.forEach((item) => { inputs[item._id] = item.qty; });
        setQtyInputs(inputs);
      } else {
        setError("Failed to load cart");
      }
    } catch (err) {
      setError("Error loading cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (itemId, newQty) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: newQty }));
  };

  const handleUpdate = async (itemId) => {
    const newQty = parseInt(qtyInputs[itemId]) || 0;
    if (newQty < 1) return;

    try {
      const response = await fetch(`/api/food/cart/update/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=set&qty=${newQty}`,
        credentials: "include",
      });
      if (response.ok) await fetchCart();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    try {
      const response = await fetch(`/api/food/cart/remove/${itemId}`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      if (response.ok) await fetchCart();
    } catch (err) {
      console.error("Remove error:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setCheckingOut(true);
    try {
      const response = await fetch("/api/food/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: orderNote }),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setOrderSuccess(data);
        setCartItems([]);
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Order success view
  if (orderSuccess) {
    return (
      <div className="cart-page">
        <div className="order-success">
          <div className="success-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2>Order Placed!</h2>
          <p className="success-msg">
            Your order has been received. We'll notify you when it's ready for <strong>self-pickup</strong>.
          </p>
          <div className="success-details">
            <div className="success-row">
              <span>Order Total</span>
              <span>${orderSuccess.order?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="success-row">
              <span>Status</span>
              <span className="status-badge status-pending">Pending</span>
            </div>
            <div className="success-row">
              <span>Pickup at</span>
              <span>42W 46th Street, NY 10036</span>
            </div>
          </div>
          <div className="success-actions">
            <Link to="/my-orders" className="btn-success-primary">
              <i className="fa-solid fa-receipt"></i> View My Orders
            </Link>
            <Link to="/menu" className="btn-success-secondary">
              Order More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-error-state">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchCart}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>
          <i className="fa-solid fa-bag-shopping"></i> Your Cart
        </h1>
        {cartItems.length > 0 && (
          <span className="cart-header-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Browse our menu to find something delicious!</p>
          <Link to="/menu" className="btn-shop-now">
            <i className="fa-solid fa-utensils"></i>
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className={`cart-item${removingId === item._id ? " removing" : ""}`}
              >
                <div className="ci-thumb">
                  <img src={item.imageUrl} alt={item.name} />
                </div>

                <div className="ci-body">
                  <div className="ci-title">{item.name}</div>
                  <div className="ci-price">${item.price.toFixed(2)} each</div>
                </div>

                <div className="ci-quantity">
                  <div className="qty-control">
                    <input
                      className="qty-input"
                      type="number"
                      min="1"
                      value={qtyInputs[item._id] || item.qty}
                      onChange={(e) => handleQtyChange(item._id, e.target.value)}
                      onBlur={() => handleUpdate(item._id)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(item._id)}
                    />
                  </div>
                </div>

                <div className="ci-subtotal">
                  ${(item.price * item.qty).toFixed(2)}
                </div>

                <button
                  className="ci-remove"
                  onClick={() => handleRemove(item._id)}
                  title="Remove item"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="pickup-notice">
              <i className="fa-solid fa-store"></i>
              <div>
                <strong>Self-Pickup Only</strong>
                <p>42W 46th Street, NY 10036</p>
              </div>
            </div>

            <div className="order-note-group">
              <label htmlFor="order-note">Order note (optional)</label>
              <textarea
                id="order-note"
                placeholder="Any special requests..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={2}
              />
            </div>

            <button
              className="btn-checkout"
              disabled={cartItems.length === 0 || checkingOut}
              onClick={handleCheckout}
            >
              {checkingOut ? (
                <>
                  <span className="btn-spinner-sm"></span>
                  Placing Order...
                </>
              ) : !user ? (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Sign In to Order
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  Place Order
                </>
              )}
            </button>

            <Link to="/menu" className="continue-shopping">
              <i className="fa-solid fa-arrow-left"></i>
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
