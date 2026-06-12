import { createContext, useContext } from "react";

export const CartContext = createContext({
  cartCount: 0,
  refreshCart: () => {},
});

export function useCart() {
  return useContext(CartContext);
}
