import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Utensils } from "lucide-react";
import { Container } from "../components/ui/Container";
import { FoodCard } from "../components/food/FoodCard";
import { FoodCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { api, endpoints } from "../lib/api";
import { cn } from "../lib/cn";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(endpoints.menu)
      .then((data) => {
        if (active) setFoods(Array.isArray(data) ? data : []);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(foods.map((f) => f.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [foods]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods.filter((f) => {
      const matchCat = activeCat === "All" || f.category === activeCat;
      const matchQ =
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [foods, query, activeCat]);

  const grouped = useMemo(() => {
    if (activeCat !== "All") return { [activeCat]: filtered };
    const map = {};
    filtered.forEach((f) => {
      const k = f.category || "Other";
      if (!map[k]) map[k] = [];
      map[k].push(f);
    });
    return map;
  }, [filtered, activeCat]);

  return (
    <main className="pb-20">
      <Container className="pt-10 md:pt-14">
        <div className="flex flex-col gap-6">
          <div>
            <Badge tone="ink" className="mb-3">Our menu</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              What are you craving today?
            </h1>
            <p className="mt-3 text-ink-500 max-w-2xl">
              Browse {foods.length || "our"} dishes — fresh, fast, and made to
              order.
            </p>
          </div>

          <div className="sticky top-20 z-30 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="glass rounded-2xl border border-ink-100 p-3 flex flex-col md:flex-row md:items-center gap-3 shadow-[var(--shadow-soft)]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search dishes, ingredients..."
                  className="w-full h-11 rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={cn(
                      "shrink-0 px-4 h-11 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                      activeCat === c
                        ? "bg-ink-900 text-white shadow-sm"
                        : "bg-white text-ink-700 border border-ink-200 hover:border-brand-300 hover:text-brand-600"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-14">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<SlidersHorizontal className="w-6 h-6" />}
              title="Couldn't load the menu"
              description={error}
            />
          ) : Object.keys(grouped).length === 0 ? (
            <EmptyState
              icon={<Utensils className="w-6 h-6" />}
              title="Nothing matches your search"
              description="Try a different keyword or category."
            />
          ) : (
            Object.entries(grouped).map(([cat, list]) => (
              <section key={cat}>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {cat}
                  </h2>
                  <span className="text-sm text-ink-500">
                    {list.length} item{list.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((f) => (
                    <FoodCard key={f._id} food={f} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </Container>
    </main>
  );
}
