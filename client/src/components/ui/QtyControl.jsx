import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

export function QtyControl({ qty, onInc, onDec, size = "md", className }) {
  const sizing =
    size === "sm"
      ? "h-9 text-sm"
      : size === "lg"
      ? "h-12 text-base"
      : "h-10 text-sm";
  const btn =
    "grid place-items-center w-9 h-full text-ink-700 hover:text-brand-600 transition-colors disabled:opacity-40";
  return (
    <div
      className={cn(
        "inline-flex items-stretch rounded-full bg-white border border-ink-200 shadow-sm overflow-hidden",
        sizing,
        className
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={onDec}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="grid place-items-center min-w-9 px-1 font-semibold text-ink-900 select-none">
        {qty}
      </span>
      <button
        type="button"
        className={btn}
        onClick={onInc}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
