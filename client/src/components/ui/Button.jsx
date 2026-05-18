import { createElement } from "react";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-[#ff7b00] to-brand-500 text-white shadow-[var(--shadow-glow)] hover:brightness-105 active:translate-y-px",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 active:translate-y-px",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:border-brand-400 hover:text-brand-600",
  ghost:
    "text-ink-700 hover:bg-ink-100/70",
  danger:
    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({
  as = "button",
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  children,
  ...props
}) {
  return createElement(
    as,
    {
      className: cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        className
      ),
      disabled: disabled || loading,
      ...props,
    },
    loading && (
      <span
        key="spinner"
        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
      />
    ),
    children
  );
}
