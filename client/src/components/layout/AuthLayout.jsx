import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff7b00] to-brand-500 text-white shadow-[var(--shadow-glow)]">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <span className="text-xl font-extrabold">
              MA<span className="text-gradient-brand">NU</span>
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-ink-500">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-500">{footer}</div>}
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-4 rounded-3xl overflow-hidden">
          <img
            src="/images/food-banner.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) =>
              (e.currentTarget.src =
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200")
            }
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/80 via-ink-900/40 to-brand-500/30" />
          <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
            <h2 className="text-3xl font-extrabold leading-tight max-w-md">
              Real food. Real fast. Made with love.
            </h2>
            <p className="mt-3 text-white/85 max-w-md">
              Join thousands of foodies who order with MANU every week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
