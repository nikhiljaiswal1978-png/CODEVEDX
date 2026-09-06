import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div className="page-shell"><p className="muted">Loading…</p></div>;

  return (
    <div className="page-shell narrow center">
      <div className="success-icon">✓</div>
      <h1>Order placed</h1>
      <p className="muted">
        Order #{order._id.slice(-8).toUpperCase()} —{" "}
        {order.paymentMethod === "cod"
          ? `pay ₹${order.totalPrice.toFixed(2)} in cash when it arrives.`
          : `charged ₹${order.totalPrice.toFixed(2)} to card ending in ${order.paymentResult?.last4 || "····"}.`}
      </p>
      <Link to="/orders" className="btn-primary">
        View my orders
      </Link>
    </div>
  );
};

export default OrderSuccess;