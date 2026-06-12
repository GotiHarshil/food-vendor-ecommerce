import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/cart-context";
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
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [recommendedCategory, setRecommendedCategory] = useState(null);

  useEffect(() => {
    fetchData();
    // Mount-only: fetchData is intended to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, cartRes, favRes, ordersRes] = await Promise.all([
        fetch("/api/food/menu", { credentials: "include" }),
        fetch("/api/food/cart", { credentials: "include" }),
        fetch("/api/user/favorites", { credentials: "include" }),
        fetch("/api/food/my-orders", { credentials: "include" }),
      ]);

      if (!foodsRes.ok) throw new Error("Failed to fetch menu");

      const foodsData = await foodsRes.json();
      const cartData = cartRes.ok ? await cartRes.json() : [];

      // Fetch favorites (ok if 401 - guest user)
      let favoriteIds = new Set();
      if (favRes.ok) {
        const favData = await favRes.json();
        favoriteIds = new Set(favData.map((f) => String(f._id)));
      }

      // Fetch orders (ok if 401 - guest user)
      let ordersData = [];
      if (ordersRes.ok) {
        ordersData = await ordersRes.json();
      }

      setFoods(foodsData);
      setCartItems(cartData);
      setFavoritedIds(favoriteIds);

      // Calculate recommendations
      if (ordersData.length > 0) {
        const categoryCounts = {};
        ordersData.forEach((order) => {
          order.items?.forEach((item) => {
            const food = foodsData.find((f) => String(f._id) === String(item.foodId));
            if (food) {
              categoryCounts[food.category] = (categoryCounts[food.category] || 0) + 1;
            }
          });
        });

        if (Object.keys(categoryCounts).length > 0) {
          const topCategory = Object.keys(categoryCounts).reduce((a, b) =>
            categoryCounts[a] > categoryCounts[b] ? a : b
          );
          setRecommendedCategory(topCategory);
        }
      }

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

  const categoryOrder = CATEGORIES.reduce((acc, c) => {
    if (c.key !== "all") acc.push(c.key);
    return acc;
  }, []);

  const handleCategoryClick = (key) => {
    setActiveCategory(key);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleToggleFavorite = (foodId) => {
    const newSet = new Set(favoritedIds);
    if (newSet.has(String(foodId))) {
      newSet.delete(String(foodId));
    } else {
      newSet.add(String(foodId));
    }
    setFavoritedIds(newSet);
  };

  const totalItems = displayFoods.length;

  // Get recommended items
  const recommendedItems = recommendedCategory
    ? foods.filter(
        (f) =>
          f.category === recommendedCategory &&
          !cartItems.some((item) => String(item.foodId) === String(f._id))
      ).slice(0, 4)
    : [];

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
          <>
            {recommendedItems.length > 0 && (
              <div className="recommended-section">
                <div className="recommended-header">
                  <i className="fa-solid fa-heart"></i>
                  <span>Based on your orders</span>
                </div>
                <div className="recommended-scroll">
                  {recommendedItems.map((food) => (
                    <div key={food._id} className="recommended-card">
                      <FoodCard
                        food={food}
                        cartItems={cartItems}
                        onUpdate={fetchData}
                        isFavorited={favoritedIds.has(String(food._id))}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="menu-grid stagger">
              {displayFoods.map((food) => (
                <FoodCard
                  key={food._id}
                  food={food}
                  cartItems={cartItems}
                  onUpdate={fetchData}
                  isFavorited={favoritedIds.has(String(food._id))}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </>
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
                          isFavorited={favoritedIds.has(String(food._id))}
                          onToggleFavorite={handleToggleFavorite}
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
