import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { QtyControl } from "../ui/QtyControl";
import { useCart } from "../../context/cart-context";
import { formatCurrency } from "../../lib/format";

export function FoodCard({ food }) {
  const { qtyOf, add, inc, dec } = useCart();
  const qty = qtyOf(food._id);
  const fallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23f3f4f6'/></svg>";

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white border border-ink-100/70 shadow-[var(--shadow-soft)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <img
          src={food.imageUrl || fallback}
          alt={food.name}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = fallback)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {food.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-ink-700 shadow-sm">
            {food.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-ink-900 leading-tight line-clamp-1">
          {food.name}
        </h3>
        {food.description && (
          <p className="mt-1 text-sm text-ink-500 line-clamp-2 min-h-10">
            {food.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-ink-900">
              {formatCurrency(food.price)}
            </span>
          </div>

          {qty > 0 ? (
            <QtyControl
              size="sm"
              qty={qty}
              onInc={() => inc(food._id)}
              onDec={() => dec(food._id)}
            />
          ) : (
            <Button
              size="sm"
              onClick={() => add(food)}
              className="!px-4"
              aria-label={`Add ${food.name}`}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
