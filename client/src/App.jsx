import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";        // Import Navbar
import "./Navbar.css";                // Navbar styling

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then((data) => {
        setFoods(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching food data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Navbar fixed at top */}
      <Navbar />

      {/* Main content */}
      <main
        style={{
          textAlign: "center",
          marginTop: "80px",
          backgroundColor: "white",
          minHeight: "100vh",
          padding: "30px 0",
        }}
      >
        <h1 style={{ color: "#ff7b00", marginBottom: "20px" }}>
          Food Vendor Menu
        </h1>

        {loading ? (
          <p style={{ color: "#555" }}>Loading menu...</p>
        ) : foods.length === 0 ? (
          <p style={{ color: "#888" }}>No items found.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {foods.map((item) => (
              <li
                key={item._id || item.id}
                style={{
                  backgroundColor: "#fff7f0",
                  border: "1px solid #ffb366",
                  borderRadius: "10px",
                  padding: "15px 25px",
                  width: "220px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ color: "#ff7b00", margin: "5px 0" }}>
                  {item.name}
                </h3>
                <p style={{ color: "#444", margin: "5px 0" }}>
                  Price: ${item.price?.toFixed(2) || item.price}
                </p>
                {item.category && (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Category: {item.category}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export default App;
