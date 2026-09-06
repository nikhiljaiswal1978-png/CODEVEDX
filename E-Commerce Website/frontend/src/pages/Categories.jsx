import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CategoryCard from "../components/CategoryCard.jsx";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Could not load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Explore collections</p>

        <h1>Shop by Category</h1>

        <p className="hero-sub">
          Find products from our different collections.
        </p>
      </section>

      {error && (
        <p className="error-banner">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">
          Loading categories...
        </p>
      ) : categories.length === 0 ? (
        <p className="muted">
          No categories available.
        </p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;