import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FoodCard.css";

export default function FoodCard({ food, cartItems = [], onUpdate, isFavorited = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const [currentQty, setCurrentQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  useEffect(() => {
    const found = cartItems.find(
      (it) => String(it.foodId) === String(food._id)
    );
    setCurrentQty(found ? found.qty : 0);
  }, [cartItems, food._id]);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const showErrorMessage = (message) => {
    setErrorMsg(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    // Check if user is logged in by attempting the API call
    setFavorited(!favorited);

    try {
      const response = await fetch(`/api/user/favorites/${food._id}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 401) {
        // Not logged in, revert and redirect
        setFavorited(favorited);
        navigate("/login");
      } else if (!response.ok) {
        // Revert on error
        setFavorited(favorited);
        showErrorMessage("Failed to update favorite");
      } else {
        // Success - call the callback if provided
        onToggleFavorite?.(food._id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavorited(favorited);
      showErrorMessage("Network error. Please try again.");
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/food/cart/add/${food._id}`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      if (response.ok) {
        setCurrentQty(1);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 600);
        onUpdate?.();
      } else {
        const data = await response.json();
        showErrorMessage(data.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCart = async (action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/food/cart/update/${food._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: `action=${action}`,
        credentials: "include",
      });

      if (response.ok) {
        if (action === "inc") {
          setCurrentQty(currentQty + 1);
        } else if (action === "dec") {
          setCurrentQty(Math.max(currentQty - 1, 0));
        }
        onUpdate?.();
      } else {
        const data = await response.json();
        showErrorMessage(data.error || "Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`food-card${justAdded ? " card-added" : ""}${!food.available ? " card-unavailable" : ""}`}>
      {isLoading && <div className="card-overlay"></div>}

      {showError && (
        <div className="error-toast">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card-image">
        <img src={food.imageUrl} alt={food.name} loading="lazy" />
        <button
          className={`card-favorite-btn${favorited ? " active" : ""}`}
          onClick={handleToggleFavorite}
          title={favorited ? "Remove favorite" : "Add to favorites"}
        >
          <i className={`fa-${favorited ? "solid" : "regular"} fa-heart`}></i>
        </button>
        <div className="card-category-badge">
          {food.category}
        </div>
        {!food.available && (
          <div className="card-unavailable-badge">Unavailable</div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{food.name}</h3>
        {food.description && (
          <p className="card-description">{food.description}</p>
        )}

        <div className="card-footer">
          <span className="price">${food.price}</span>

          <div className="cart-control">
            {currentQty < 1 ? (
              <button
                className="btn-add"
                onClick={handleAddToCart}
                disabled={isLoading || !food.available}
              >
                <i className="fa-solid fa-plus"></i>
                Add
              </button>
            ) : (
              <div className="quantity-wrapper">
                <button
                  className="btn-qty btn-qty-minus"
                  onClick={() => handleUpdateCart("dec")}
                  disabled={isLoading}
                >
                  {currentQty === 1 ? (
                    <i className="fa-solid fa-trash-can" style={{ fontSize: "0.7rem" }}></i>
                  ) : (
                    <i className="fa-solid fa-minus"></i>
                  )}
                </button>
                <span className="qty-value">{currentQty}</span>
                <button
                  className="btn-qty btn-qty-plus"
                  onClick={() => handleUpdateCart("inc")}
                  disabled={isLoading}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
