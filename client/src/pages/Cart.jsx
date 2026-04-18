import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { QtyControl } from "../components/ui/QtyControl";
import { EmptyState } from "../components/ui/EmptyState";
import { useCart } from "../context/cart-context";
import { formatCurrency } from "../lib/format";

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.08;

export default function Cart() {
  const { items, loading, subtotal, inc, dec, remove } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal === 0 ? 0 : subtotal + DELIVERY_FEE + tax;

  return (
    <main className="pb-20">
      <Container className="pt-10 md:pt-14">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Your cart
          </h1>
          <p className="mt-2 text-ink-500">
            {items.length === 0
              ? "Nothing in here yet."
              : `${items.length} item${items.length === 1 ? "" : "s"} ready to go.`}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white border border-ink-100 p-10 text-center text-ink-500">
            Loading your cart…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="Your cart is empty"
            description="Hungry? Browse the menu and add a few favorites — we'll have it ready in minutes."
            action={
              <Button as={Link} to="/menu" size="md">
                Browse menu <ArrowRight className="w-4 h-4" />
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-2xl bg-white border border-ink-100 shadow-[var(--shadow-soft)] divide-y divide-ink-100">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-4 sm:p-5"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.style.visibility = "hidden")
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-900 truncate">
                      {item.name}
                    </h3>
                    <div className="mt-1 text-sm text-ink-500">
                      {formatCurrency(item.price)} each
                    </div>
                    <div className="mt-3 flex items-center gap-3 sm:hidden">
                      <QtyControl
                        size="sm"
                        qty={item.qty}
                        onInc={() => inc(item.foodId)}
                        onDec={() => dec(item.foodId)}
                      />
                      <button
                        onClick={() => remove(item.foodId)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <QtyControl
                      qty={item.qty}
                      onInc={() => inc(item.foodId)}
                      onDec={() => dec(item.foodId)}
                    />
                    <button
                      onClick={() => remove(item.foodId)}
                      className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="hidden sm:block min-w-24 text-right font-extrabold text-ink-900">
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 h-fit rounded-2xl bg-white border border-ink-100 shadow-[var(--shadow-card)] p-6">
              <h2 className="text-lg font-bold text-ink-900">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                <SummaryRow label="Delivery" value={formatCurrency(DELIVERY_FEE)} />
                <SummaryRow label="Tax (8%)" value={formatCurrency(tax)} />
                <div className="my-3 border-t border-dashed border-ink-200" />
                <div className="flex items-center justify-between">
                  <dt className="text-base font-bold text-ink-900">Total</dt>
                  <dd className="text-xl font-extrabold text-ink-900">
                    {formatCurrency(total)}
                  </dd>
                </div>
              </dl>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() => alert("Checkout flow coming soon.")}
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Link
                to="/menu"
                className="mt-3 block text-center text-sm font-semibold text-ink-600 hover:text-brand-600"
              >
                Continue shopping
              </Link>

              <div className="mt-6 rounded-xl bg-brand-50 text-brand-700 p-3 text-xs font-semibold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Free delivery on orders over $30
              </div>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-ink-600">
      <dt>{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
