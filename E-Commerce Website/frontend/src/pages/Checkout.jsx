import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/axios.js";

const formatCardNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length < 3 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "India",
  });

  const [card, setCard] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const shipping = subtotal > 100 ? 0 : 9.99;
  const codFee = paymentMethod === "cod" ? 2 : 0;
  const total = subtotal + shipping + codFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i._id,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        ...(paymentMethod === "card" ? { card } : {}),
      };

      const { data } = await api.post("/orders", payload);

      clearCart();
      navigate(`/order-success/${data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <h1>Checkout</h1>

      <p className="muted note">
        This demo validates card details and simulates a payment. No real card
        network is contacted.
      </p>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form">
          <h3>Shipping address</h3>

          <input
            required
            placeholder="Full name"
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />

          <input
            required
            placeholder="Street address"
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
          />

          <div className="form-row">
            <input
              required
              placeholder="City"
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
            />

            <input
              required
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
            />
          </div>

          <input
            required
            placeholder="Country"
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          />

          <h3>Payment method</h3>

          <div className="payment-method-options">
            <label
              className={`payment-option ${
                paymentMethod === "card" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />

              <div>
                <strong>Credit / debit card</strong>
                <p className="muted note">Charged immediately (simulated).</p>
              </div>
            </label>

            <label
              className={`payment-option ${
                paymentMethod === "cod" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />

              <div>
                <strong>Cash on delivery</strong>
                <p className="muted note">
                  Pay in cash when your order arrives. ₹2 handling fee.
                </p>
              </div>
            </label>
          </div>

          {paymentMethod === "card" && (
            <>
              <input
                required
                placeholder="Card number"
                inputMode="numeric"
                maxLength={19}
                value={card.cardNumber}
                onChange={(e) =>
                  setCard({
                    ...card,
                    cardNumber: formatCardNumber(e.target.value),
                  })
                }
              />

              <div className="form-row">
                <input
                  required
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  value={card.expiry}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      expiry: formatExpiry(e.target.value),
                    })
                  }
                />

                <input
                  required
                  placeholder="CVV"
                  inputMode="numeric"
                  maxLength={4}
                  value={card.cvv}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                />
              </div>
            </>
          )}

          {error && <p className="error-banner">{error}</p>}

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading
              ? "Processing…"
              : paymentMethod === "cod"
              ? `Place order — pay ₹${total.toFixed(2)} on delivery`
              : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>

        <div className="cart-summary">
          <h3>Order summary</h3>

          {items.map((i) => (
            <div className="summary-row" key={i._id}>
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>₹{(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
            </span>
          </div>

          {codFee > 0 && (
            <div className="summary-row">
              <span>Cash on delivery fee</span>
              <span>₹{codFee.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
