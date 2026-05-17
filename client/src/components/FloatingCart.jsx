import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./FloatingCart.css";

export default function FloatingCart() {
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  if (cartCount === 0 || pathname === "/cart") return null;

  return (
    <Link to="/cart" className="floating-cart" aria-label={`Cart (${cartCount} items)`}>
      <i className="fa-solid fa-bag-shopping"></i>
      <span className="floating-cart-count">{cartCount}</span>
    </Link>
  );
}
