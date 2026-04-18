import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { api, endpoints } from "../lib/api";
import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const inflight = useRef(new Map());

  const refresh = useCallback(async () => {
    try {
      const data = await api.get(endpoints.cart);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setQtyLocal = (foodId, qty, food) => {
    setItems((prev) => {
      const existing = prev.find((i) => String(i.foodId) === String(foodId));
      if (qty <= 0) {
        return prev.filter((i) => String(i.foodId) !== String(foodId));
      }
      if (existing) {
        return prev.map((i) =>
          String(i.foodId) === String(foodId) ? { ...i, qty } : i
        );
      }
      return [
        ...prev,
        {
          _id: `temp-${foodId}`,
          foodId,
          name: food?.name,
          price: food?.price,
          imageUrl: food?.imageUrl,
          qty,
        },
      ];
    });
  };

  const guard = async (foodId, fn) => {
    const key = String(foodId);
    if (inflight.current.get(key)) return;
    inflight.current.set(key, true);
    try {
      await fn();
    } finally {
      inflight.current.delete(key);
    }
  };

  const add = useCallback(
    async (food) => {
      const id = food._id;
      const current = items.find((i) => String(i.foodId) === String(id));
      const next = (current?.qty || 0) + 1;
      setQtyLocal(id, next, food);
      await guard(id, async () => {
        try {
          await api.post(endpoints.cartAdd(id));
          toast.success(`Added ${food.name}`);
        } catch (e) {
          toast.error(e.message || "Could not add item");
          await refresh();
        }
      });
    },
    [items, refresh]
  );

  const inc = useCallback(
    async (foodId) => {
      const current = items.find((i) => String(i.foodId) === String(foodId));
      setQtyLocal(foodId, (current?.qty || 0) + 1);
      await guard(foodId, async () => {
        try {
          await api.post(endpoints.cartUpdate(foodId), { action: "inc" });
        } catch {
          await refresh();
        }
      });
    },
    [items, refresh]
  );

  const dec = useCallback(
    async (foodId) => {
      const current = items.find((i) => String(i.foodId) === String(foodId));
      const next = (current?.qty || 0) - 1;
      setQtyLocal(foodId, next);
      await guard(foodId, async () => {
        try {
          await api.post(endpoints.cartUpdate(foodId), { action: "dec" });
        } catch {
          await refresh();
        }
      });
    },
    [items, refresh]
  );

  const setQty = useCallback(
    async (foodId, qty) => {
      const n = Math.max(0, parseInt(qty, 10) || 0);
      setQtyLocal(foodId, n);
      await guard(foodId, async () => {
        try {
          await api.post(endpoints.cartUpdate(foodId), {
            action: "set",
            qty: n,
          });
        } catch {
          await refresh();
        }
      });
    },
    [refresh]
  );

  const remove = useCallback(
    async (foodId) => {
      setQtyLocal(foodId, 0);
      await guard(foodId, async () => {
        try {
          await api.post(endpoints.cartRemove(foodId));
          toast.success("Removed from cart");
        } catch {
          await refresh();
        }
      });
    },
    [refresh]
  );

  const value = useMemo(() => {
    const qtyOf = (foodId) =>
      items.find((i) => String(i.foodId) === String(foodId))?.qty || 0;
    const subtotal = items.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
      0
    );
    const count = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    return {
      items,
      loading,
      qtyOf,
      subtotal,
      count,
      add,
      inc,
      dec,
      setQty,
      remove,
      refresh,
    };
  }, [items, loading, add, inc, dec, setQty, remove, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
