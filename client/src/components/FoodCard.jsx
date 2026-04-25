import React, { useState, useEffect } from "react";
import "./FoodCard.css";

export default function FoodCard({ food, cartItems = [], onUpdate }) {
  const [currentQty, setCurrentQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const found = cartItems.find(
      (it) => String(it.foodId) === String(food._id)
    );
    setCurrentQty(found ? found.qty : 0);
  }, [cartItems, food._id]);

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
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
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
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`food-card${justAdded ? " card-added" : ""}`}>
      {isLoading && <div className="card-overlay"></div>}

      <div className="card-image">
        <img src={food.imageUrl} alt={food.name} loading="lazy" />
        <div className="card-category-badge">
          {food.category}
        </div>
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
                disabled={isLoading}
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
