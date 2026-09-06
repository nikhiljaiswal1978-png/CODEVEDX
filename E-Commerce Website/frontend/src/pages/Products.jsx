import { useEffect, useState } from "react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Our collection</p>

        <h1>All Products</h1>

        <p className="hero-sub">
          Explore our complete collection of carefully selected products.
        </p>
      </section>

      {error && (
        <p className="error-banner">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <p className="muted">
          No products available.
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

export default Products;