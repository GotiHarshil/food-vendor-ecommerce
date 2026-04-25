import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
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
  );
}
