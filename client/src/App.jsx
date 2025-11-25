// client/src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";

function Home({ foods, loading }) {
  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      {/* <h2>Available Food Items</h2> */}
      <ul>
        {foods.map((item) => (
          <li key={item._id}>
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home foods={foods} loading={loading} />} />
      </Routes>
    </Router>
  );
}

export default App;
