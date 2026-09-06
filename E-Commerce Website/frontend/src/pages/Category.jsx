import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const Category = () => {
  const { name } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/products", {
          params: {
            category: name,
          },
        });

        setProducts(data.products);
      } catch (err) {
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [name]);

  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Category</p>

        <h1>{name}</h1>

        <p className="hero-sub">
          Explore our {name.toLowerCase()} collection.
        </p>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="muted">
          No products available in this category.
        </p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;