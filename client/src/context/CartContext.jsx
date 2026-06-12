import { useState, useCallback, useEffect } from "react";
import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/food/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.reduce((sum, item) => sum + item.qty, 0));
      } else {
        setCartCount(0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
