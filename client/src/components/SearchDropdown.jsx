import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchDropdown.css";

let foodsCache = null;

export default function SearchDropdown({ query, isFocused }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("manu_search_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading search history:", e);
      }
    }
  }, []);

  // Fetch foods for suggestions (lazy load, cached)
  useEffect(() => {
    if (!isFocused) return;

    if (foodsCache) {
      setFoods(foodsCache);
      return;
    }

    setLoading(true);
    fetch("/api/food/menu", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        foodsCache = data;
        setFoods(data);
      })
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  }, [isFocused]);

  const suggestions = query.trim()
    ? foods
        .filter((f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.description?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleSelectHistory = (term) => {
    navigate(`/menu?search=${encodeURIComponent(term)}`);
  };

  const handleSelectSuggestion = (foodName) => {
    // Add to history
    const newHistory = [foodName, ...history.filter((h) => h !== foodName)].slice(0, 8);
    setHistory(newHistory);
    localStorage.setItem("manu_search_history", JSON.stringify(newHistory));

    navigate(`/menu?search=${encodeURIComponent(foodName)}`);
  };

  const handleRemoveHistoryItem = (e, term) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h !== term);
    setHistory(newHistory);
    localStorage.setItem("manu_search_history", JSON.stringify(newHistory));
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem("manu_search_history");
  };

  if (!isFocused) return null;

  return (
    <div className="search-dropdown" ref={dropdownRef}>
      {!query.trim() && history.length > 0 ? (
        <>
          <div className="dropdown-section">
            <div className="dropdown-section-header">
              <span>Recent Searches</span>
              <button className="clear-all-btn" onClick={handleClearHistory}>
                Clear All
              </button>
            </div>
            <div className="dropdown-items">
              {history.map((term) => (
                <div key={term} className="dropdown-item history-item">
                  <button
                    type="button"
                    className="history-item-main"
                    onClick={() => handleSelectHistory(term)}
                  >
                    <i className="fa-solid fa-clock"></i>
                    <span>{term}</span>
                  </button>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => handleRemoveHistoryItem(e, term)}
                    aria-label={`Remove ${term} from search history`}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : query.trim() ? (
        <div className="dropdown-section">
          {loading ? (
            <div className="dropdown-loading">
              <span className="loader"></span>
              <span>Loading suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="dropdown-section-header">
                <span>Suggestions</span>
              </div>
              <div className="dropdown-items">
                {suggestions.map((food) => (
                  <button
                    key={food._id}
                    className="dropdown-item suggestion-item"
                    onClick={() => handleSelectSuggestion(food.name)}
                  >
                    <i className="fa-solid fa-utensils"></i>
                    <div className="suggestion-content">
                      <span className="suggestion-name">{food.name}</span>
                      <span className="suggestion-category">{food.category}</span>
                    </div>
                    <span className="suggestion-price">${food.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="dropdown-empty">
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>No results found</span>
            </div>
          )}
        </div>
      ) : (
        <div className="dropdown-empty">
          <span>Start typing to search</span>
        </div>
      )}
    </div>
  );
}
