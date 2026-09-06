import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/users");

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        setError("Invalid users response from server.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page-shell admin-page">
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p className="muted">View all registered users</p>
        </div>

        <div className="admin-nav">
          <Link to="/admin" className="admin-tab">Overview</Link>
          <Link to="/admin/products" className="admin-tab">Products</Link>
          <Link to="/admin/orders" className="admin-tab">Orders</Link>
          <Link to="/admin/users" className="admin-tab active">Users</Link>
          <Link to="/admin/refunds" className="admin-tab">
            Refund Complaints
          </Link>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading && <p className="muted">Loading users...</p>}

      {!loading && !error && users.length === 0 && (
        <div className="empty-state">
          <h3>No users found</h3>
          <p className="muted">There are no registered users yet.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="users-panel">
          <div className="users-panel-header">
            <div>
              <h2>Registered Users</h2>
              <p className="muted">
                {users.length} user{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="user-name-cell">
                        <span className="user-avatar">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                        <strong>{user.name || "Unknown User"}</strong>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "admin"
                            ? "role-admin"
                            : "role-customer"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="view-user-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
