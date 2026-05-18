<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/CartContext";
import "./Menu.css";

const CATEGORIES = [
  { key: "all", label: "All", icon: "fa-solid fa-grip" },
  { key: "Signature Dabeli", label: "Signature Dabeli", icon: "fa-solid fa-star" },
  { key: "Spicy Specials", label: "Spicy Specials", icon: "fa-solid fa-pepper-hot" },
  { key: "Loaded Varieties", label: "Loaded Varieties", icon: "fa-solid fa-layer-group" },
  { key: "Snacks and sides", label: "Snacks & Sides", icon: "fa-solid fa-cookie-bite" },
  { key: "Beverages", label: "Beverages", icon: "fa-solid fa-mug-hot" },
];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img"></div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton-footer">
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const sectionRefs = useRef({});
  const { refreshCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, cartRes] = await Promise.all([
        fetch("/api/food/menu", { credentials: "include" }),
        fetch("/api/food/cart", { credentials: "include" }),
      ]);

      if (!foodsRes.ok) throw new Error("Failed to fetch menu");

      const foodsData = await foodsRes.json();
      const cartData = cartRes.ok ? await cartRes.json() : [];

      setFoods(foodsData);
      setCartItems(cartData);
      refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search
  const filtered = searchQuery
    ? foods.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : foods;

  // Filter by category
  const displayFoods =
    activeCategory === "all"
      ? filtered
      : filtered.filter((f) => f.category === activeCategory);

  // Group by category for "all" view
  const groupedFoods = displayFoods.reduce((acc, food) => {
    if (!acc[food.category]) acc[food.category] = [];
    acc[food.category].push(food);
    return acc;
  }, {});

  const categoryOrder = CATEGORIES.filter((c) => c.key !== "all").map((c) => c.key);

  const handleCategoryClick = (key) => {
    setActiveCategory(key);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const totalItems = displayFoods.length;

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-header">
        <div className="menu-header-content">
          <h1 className="menu-title">Our Menu</h1>
          <p className="menu-subtitle">
            {searchQuery
              ? `Showing results for "${searchQuery}"`
              : "Explore our carefully curated selection of delicious dishes"}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs-wrapper">
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`category-tab${activeCategory === cat.key ? " active" : ""}`}
              onClick={() => handleCategoryClick(cat.key)}
            >
              <i className={cat.icon}></i>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="menu-content">
        {loading ? (
          <div className="menu-grid stagger">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="menu-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchData}>
              Try Again
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="menu-empty">
            <i className="fa-solid fa-bowl-food"></i>
            <h3>No dishes found</h3>
            <p>
              {searchQuery
                ? "Try a different search term"
                : "No items available in this category right now"}
            </p>
          </div>
        ) : activeCategory !== "all" ? (
          /* Single category view */
          <div className="menu-grid stagger">
            {displayFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                cartItems={cartItems}
                onUpdate={fetchData}
              />
            ))}
          </div>
        ) : (
          /* All categories grouped */
          <div className="menu-sections stagger">
            {categoryOrder.map(
              (category) =>
                groupedFoods[category] && (
                  <section
                    key={category}
                    className="category-section animate-fade-in-up"
                    ref={(el) => (sectionRefs.current[category] = el)}
                  >
                    <div className="category-header">
                      <h2 className="category-title">{category}</h2>
                      <span className="category-count">
                        {groupedFoods[category].length} items
                      </span>
                    </div>
                    <div className="menu-grid">
                      {groupedFoods[category].map((food) => (
                        <FoodCard
                          key={food._id}
                          food={food}
                          cartItems={cartItems}
                          onUpdate={fetchData}
                        />
                      ))}
                    </div>
                  </section>
                )
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && !error && totalItems > 0 && (
          <div className="results-info">
            Showing {totalItems} {totalItems === 1 ? "item" : "items"}
            {activeCategory !== "all" && ` in ${activeCategory}`}
          </div>
        )}
      </div>
    </div>
=======
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
>>>>>>> claude/condescending-swirles-7a4876
  );
}
