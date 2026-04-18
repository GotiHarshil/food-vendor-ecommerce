import { cn } from "../../lib/cn";

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center",
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-500">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-ink-500 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
