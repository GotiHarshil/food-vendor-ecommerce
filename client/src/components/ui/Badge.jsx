import { cn } from "../../lib/cn";

const tones = {
  brand: "bg-brand-100 text-brand-700",
  ink: "bg-ink-100 text-ink-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
};

export function Badge({ tone = "brand", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
