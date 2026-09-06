import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError("Product not found.");
      }
    };
    fetchProduct();
  }, [id]);

  if (error) return <div className="page-shell"><p className="error-banner">{error}</p></div>;
  if (!product) return <div className="page-shell"><p className="muted">Loading…</p></div>;

  return (
    <div className="page-shell">
      <div className="product-detail">
        <img src={product.image} alt={product.name} />
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="rating">★ {product.rating.toFixed(1)}</p>
          <p className="description">{product.description}</p>
          <p className="detail-price">₹{product.price.toFixed(2)}</p>
          <p className={`stock ${product.stock === 0 ? "out" : ""}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {product.stock > 0 && (
            <div className="qty-row">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              />
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn-outline"
              disabled={product.stock === 0}
              onClick={() => addItem(product, qty)}
            >
              Add to cart
            </button>
            <button
              className="btn-primary"
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product, qty);
                navigate("/cart");
              }}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
