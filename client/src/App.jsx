import { useEffect, useState } from "react";

function App() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then((data) => setFoods(data))
      .catch((err) => console.error("Error fetching food data:", err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Food Vendor Menu</h1>

      {foods.length === 0 ? (
        <p>Loading menu...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {foods.map((item) => (
            <li
              key={item.id}
              style={{
                background: "#f4f4f4",
                margin: "10px auto",
                padding: "10px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              🍴 <strong>{item.name}</strong> — ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
