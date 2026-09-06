import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CategoryCard from "../components/CategoryCard.jsx";
import ProductCard from "../components/ProductCard.jsx";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categoryError, setCategoryError] = useState("");
  const [productError, setProductError] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProductError("Could not load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoryError("Could not load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="page-shell">

      {/* Hero */}
      <section className="hero">
        <div>
          <p className="eyebrow">
            Curated goods, honestly priced
          </p>

          <h1>Things worth keeping.</h1>

          <p className="hero-sub">
            Explore our carefully selected collections.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2>Shop by Category</h2>

        {categoryError && (
          <p className="error-banner">
            {categoryError}
          </p>
        )}

        {loadingCategories ? (
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
      </section>

      {/* Products */}
      <section className="products-section">
        <h2>Featured Products</h2>

        {productError && (
          <p className="error-banner">
            {productError}
          </p>
        )}

        {loadingProducts ? (
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
      </section>

    </div>
  );
};

export default Home;