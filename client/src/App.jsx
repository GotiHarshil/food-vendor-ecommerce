import { useEffect, useState } from "react";
import Navbar from "./navbar.jsx";

function App() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then((data) => setFoods(data))
      .catch((err) => console.error("Error fetching food data:", err));
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Food Vendor Menu</h1>
    </div>
  );
}

export default App;
