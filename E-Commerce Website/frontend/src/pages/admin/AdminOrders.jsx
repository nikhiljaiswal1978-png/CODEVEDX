import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/admin/all");
      setOrders(data);
    } catch (err) {
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      setError("Could not update order status.");
    }
  };

  return (
    <div className="page-shell">
      <div className="admin-header">
        <h1>Admin dashboard</h1>
        <div className="admin-nav">
          <Link to="/admin" className="admin-tab">Overview</Link>
          <Link to="/admin/products" className="admin-tab">Products</Link>
          <Link to="/admin/orders" className="admin-tab active">Orders</Link>
          <Link to="/admin/users" className="admin-tab">Users</Link>
          <Link to="/admin/refunds" className="admin-tab">Refund Complaints</Link>
        </div>
      </div>

      <h3>All orders ({orders.length})</h3>
      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Placed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name || "—"}<br /><span className="muted">{o.user?.email}</span></td>
                <td>{o.items.length}</td>
                <td>₹{o.totalPrice.toFixed(2)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;