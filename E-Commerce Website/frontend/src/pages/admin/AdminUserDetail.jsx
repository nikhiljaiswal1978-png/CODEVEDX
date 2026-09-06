import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios.js";

const AdminUserDetail = () => {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("REQUESTING USER:", id);

            const response = await api.get(`/users/${id}`);

            console.log("USER RESPONSE:", response.data);

            setUser(response.data);

        } catch (err) {
            console.error("Error fetching user:", err);

            setError(
                err.response?.data?.message ||
                "Could not load user details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="page-shell admin-user-detail-page">
                <p className="muted">Loading user details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-shell admin-user-detail-page">

                <Link
                    to="/admin/users"
                    className="back-link"
                >
                    ← Back to Users
                </Link>

                <div className="error-banner">
                    {error}
                </div>

            </div>
        );
    }

    if (!user) {
        return (
            <div className="page-shell admin-user-detail-page">

                <Link
                    to="/admin/users"
                    className="back-link"
                >
                    ← Back to Users
                </Link>

                <div className="empty-state">
                    <h3>User not found</h3>
                    <p className="muted">
                        This user does not exist.
                    </p>
                </div>

            </div>
        );
    }

    return (
        <div className="page-shell admin-user-detail-page">

            {/* Header */}
            <div className="admin-header">

                <div>
                    <Link
                        to="/admin/users"
                        className="back-link"
                    >
                        ← Back to Users
                    </Link>

                    <h1>User Details</h1>

                    <p className="muted">
                        View registered user information
                    </p>
                </div>

                <div className="admin-nav">

                    <Link
                        to="/admin"
                        className="admin-tab"
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
                        className="admin-tab active"
                    >
                        Users
                    </Link>

                    <Link
                        to="/admin/refunds"
                        className="admin-tab"
                    >
                        Refund Complaints
                    </Link>

                </div>

            </div>

            {/* User Profile */}
            <div className="user-detail-card">

                <div className="user-detail-profile">

                    <div className="large-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2>{user.name}</h2>

                        <span
                            className={`role-badge ${
                                user.role === "admin"
                                    ? "role-admin"
                                    : "role-customer"
                            }`}
                        >
                            {user.role === "admin"
                                ? "Admin"
                                : "Customer"}
                        </span>
                    </div>

                </div>

                {/* Information */}
                <div className="user-detail-info">

                    <div className="user-info-item">
                        <span className="user-info-label">
                            Full Name
                        </span>

                        <strong>
                            {user.name || "—"}
                        </strong>
                    </div>

                    <div className="user-info-item">
                        <span className="user-info-label">
                            Email
                        </span>

                        <strong>
                            {user.email || "—"}
                        </strong>
                    </div>

                    <div className="user-info-item">
                        <span className="user-info-label">
                            Role
                        </span>

                        <strong>
                            {user.role === "admin"
                                ? "Administrator"
                                : "Customer"}
                        </strong>
                    </div>

                    <div className="user-info-item">
                        <span className="user-info-label">
                            Registered
                        </span>

                        <strong>
                            {user.createdAt
                                ? new Date(
                                    user.createdAt
                                ).toLocaleDateString()
                                : "—"}
                        </strong>
                    </div>

                    <div className="user-info-item">
                        <span className="user-info-label">
                            User ID
                        </span>

                        <strong className="user-id">
                            {user._id}
                        </strong>
                    </div>

                </div>

                {/* Action */}
                <div className="user-detail-actions">

                    <Link
                        to="/admin/users"
                        className="btn-outline"
                    >
                        ← Back to Users
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default AdminUserDetail;