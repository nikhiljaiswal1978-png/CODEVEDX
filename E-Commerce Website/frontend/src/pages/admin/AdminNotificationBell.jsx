import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const AdminNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const lastSeen = localStorage.getItem("admin_notifications_seen");

      const url = lastSeen
        ? `/orders/admin?since=${encodeURIComponent(lastSeen)}`
        : `/orders/admin`;

      const { data } = await api.get(url);

      const orders = Array.isArray(data)
        ? data
        : data.orders || [];

      setNotifications(orders);
    } catch (error) {
      console.error(
        "Failed to load admin notifications:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkSeen = () => {
    localStorage.setItem(
      "admin_notifications_seen",
      new Date().toISOString()
    );

    setNotifications([]);
  };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-button"
        onClick={handleOpen}
        aria-label="New order notifications"
      >
        🔔

        {notifications.length > 0 && (
          <span className="notification-badge">
            {notifications.length > 99 ? "99+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <strong>New Orders</strong>

            {notifications.length > 0 && (
              <button type="button" onClick={handleMarkSeen}>
                Mark all seen
              </button>
            )}
          </div>

          {loading && (
            <div className="notification-item">
              <span>Checking for new orders...</span>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="notification-item">
              <strong>No new orders</strong>
              <small>You're all caught up.</small>
            </div>
          )}

          {!loading &&
            notifications.map((order) => (
              <div
                className="notification-item"
                key={order._id}
              >
                <strong>New order received</strong>

                <span>
                  Order #
                  {order._id?.slice(-6).toUpperCase()}
                </span>

                {order.user?.name && (
                  <span>
                    Customer: {order.user.name}
                  </span>
                )}

                <small>
                  ₹{Number(order.totalPrice || order.total || 0).toLocaleString("en-IN")}
                </small>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;