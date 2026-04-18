import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef(function Input(
  { className, label, hint, error, leftIcon, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-ink-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 rounded-xl border border-ink-200 bg-white px-4 text-ink-900 placeholder:text-ink-400 transition-colors outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100",
            leftIcon && "pl-10",
            error && "border-red-300 focus:border-red-400 focus:ring-red-100",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-ink-500">{hint}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
