import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { FoodCard } from "../components/food/FoodCard";
import { FoodCardSkeleton } from "../components/ui/Skeleton";
import { api, endpoints } from "../lib/api";

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get(endpoints.menu)
      .then((data) => {
        if (active) setFoods(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => active && setFoods([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="pb-20">
      <Hero />
      <Stats />
      <Featured foods={foods} loading={loading} />
      <Features />
      <CTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Container className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="animate-[fade-up_0.6s_ease_both]">
            <Badge tone="brand" className="mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Fresh today, just for you
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink-900 leading-[1.05]">
              Delicious food,{" "}
              <span className="text-gradient-brand">delivered.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-500 max-w-xl">
              Hand-crafted dabelis, loaded specials and warm classics — made
              fresh, delivered fast. Order in seconds, smile for hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/menu" size="lg">
                Explore menu
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button as={Link} to="/cart" variant="outline" size="lg">
                View cart
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((c, i) => (
                  <span
                    key={c}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-200 to-brand-400 text-white text-xs font-bold border-2 border-white"
                    style={{ zIndex: 4 - i }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="ml-2 text-ink-900 font-bold">4.9</span>
                </div>
                <p className="text-ink-500">Loved by 12,000+ foodies</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-brand-200/40 via-brand-100/30 to-transparent rounded-[3rem] blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)] border border-white">
              <img
                src="/images/food-banner.jpg"
                alt="Hero food"
                className="aspect-[4/5] w-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900")
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[var(--shadow-card)] border border-ink-100 animate-[float_5s_ease-in-out_infinite]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">100% Fresh</div>
                <div className="text-xs text-ink-500">Locally sourced</div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[var(--shadow-card)] border border-ink-100 animate-[float_6s_ease-in-out_infinite_0.5s]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">25 min</div>
                <div className="text-xs text-ink-500">Average delivery</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "12k+", v: "Happy customers" },
    { k: "60+", v: "Menu items" },
    { k: "25 min", v: "Avg delivery" },
    { k: "4.9★", v: "Average rating" },
  ];
  return (
    <section className="py-8">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl bg-ink-900 text-white p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(35,49,79,0.7)]">
          {items.map((s) => (
            <div key={s.v} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {s.k}
              </div>
              <div className="text-xs md:text-sm text-ink-300 mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Featured({ foods, loading }) {
  return (
    <section className="py-16">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <Badge tone="ink" className="mb-3">Featured</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hot off the kitchen
            </h2>
            <p className="mt-2 text-ink-500 max-w-xl">
              A taste of what's trending today. Fresh ingredients, bold flavors.
            </p>
          </div>
          <Button as={Link} to="/menu" variant="outline" size="md" className="shrink-0">
            See all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))
            : foods.length > 0
            ? foods.map((f) => <FoodCard key={f._id} food={f} />)
            : (
              <div className="col-span-full rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500">
                No items yet — your menu is ready to be filled.
              </div>
            )}
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Fresh ingredients",
      text: "Sourced daily from local markets — quality you can taste in every bite.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Delivered fast",
      text: "Average 25-minute delivery, hot and ready, straight to your door.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Safe & hygienic",
      text: "Contactless packaging and strict hygiene standards in every kitchen.",
    },
  ];
  return (
    <section className="py-16">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge tone="ink" className="mb-3">Why MANU</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Built around three simple ideas
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="group rounded-2xl bg-white p-7 border border-ink-100/80 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                {it.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{it.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-12">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff7b00] to-brand-600 p-10 md:p-14 text-white shadow-[var(--shadow-glow)]">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Hungry already?
              </h3>
              <p className="mt-2 text-white/85 max-w-xl">
                Browse the menu, fill your cart, and we'll handle the rest.
              </p>
            </div>
            <Button
              as={Link}
              to="/menu"
              variant="secondary"
              size="lg"
              className="!bg-white !text-ink-900 hover:!bg-ink-100"
            >
              Order now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
