import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const statusColors = {
  pending: "pending",
  paid: "paid",
  shipped: "paid",
  delivered: "paid",
  cancelled: "cancelled",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await api.get("/orders/my");
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="page-shell"><p className="muted">Loading…</p></div>;

  return (
    <div className="page-shell">
      <h1>Your orders</h1>
      {orders.length === 0 ? (
        <p className="muted">
          No orders yet. <Link to="/">Start shopping</Link>
        </p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <Link to={`/orders/${o._id}`} className="order-card" key={o._id}>
              <div>
                <p className="order-id">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="muted">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="muted">{o.items.length} item(s)</p>
              <span className={`status-badge ${statusColors[o.status]}`}>{o.status}</span>
              <span className="order-total">₹{o.totalPrice.toFixed(2)}</span>
              <span className="order-chevron">&rsaquo;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;