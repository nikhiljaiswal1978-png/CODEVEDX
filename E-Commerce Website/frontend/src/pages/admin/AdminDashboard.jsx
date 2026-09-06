import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/orders/admin/stats");
                setStats(data);
            } catch (err) {
                console.error("Admin stats error:", err);
                setError("Could not load admin stats.");
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="page-shell">
            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="muted">
                        Manage your Fernweg store
                    </p>
                </div>
                <div className="admin-nav">
                    <Link
                        to="/admin"
                        className="admin-tab active"
                    >
                        Overview
                    </Link>
                    <Link
                        to="/admin/products"
                        className="admin-tab"
                    >
                        Products
                    </Link>
                    <Link
                        to="/admin/orders"
                        className="admin-tab"
                    >
                        Orders
                    </Link>
                    <Link
                        to="/admin/users"
                        className="admin-tab"
                    >
                        Users
                    </Link>
                    <Link to="/admin/refunds" className="admin-tab">
                        Refund Complaints
                    </Link>
                </div>
            </div>

            {error && (
                <p className="error-banner">
                    {error}
                </p>
            )}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">
                            Total revenue
                        </span>
                        <span className="stat-value">
                            ₹{Number(stats.totalRevenue || 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">
                            Orders
                        </span>
                        <span className="stat-value">
                            {stats.totalOrders}
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">
                            Products
                        </span>
                        <span className="stat-value">
                            {stats.totalProducts}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">
                            Registered users
                        </span>

                        <span className="stat-value">
                            {stats.totalUsers}
                        </span>
                        <Link
                            to="/admin/users"
                            className="stat-link"
                        >
                            View users →
                        </Link>
                    </div>
                </div>
            )}
            {stats && stats.lowStock?.length > 0 && (
                <div className="low-stock-panel">

                    <h3>
                        Low stock (5 or fewer left)
                    </h3>
                    <ul>
                        {stats.lowStock.map((p) => (
                            <li key={p._id}>
                                {p.name} —{" "}
                                <strong>
                                    {p.stock}
                                </strong>{" "}
                                left
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;