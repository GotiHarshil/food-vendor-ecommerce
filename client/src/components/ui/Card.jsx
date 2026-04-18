import { cn } from "../../lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-[var(--shadow-card)] border border-ink-100/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
