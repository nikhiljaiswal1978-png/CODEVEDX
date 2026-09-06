import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="product-card">
      <Link
        to={`/product/${product._id}`}
        className="product-image-link"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <Link to={`/product/${product._id}`}>
          <h3>{product.name}</h3>
        </Link>

        <div className="product-footer">
          <span className="product-price">
            ₹{product.price.toFixed(2)}
          </span>

          <button
            className="btn-add"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {product.stock === 0 ? "Out of stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;