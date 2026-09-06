import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import AdminNotificationBell from "../pages/admin/AdminNotificationBell.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout clicked");

    logout();

    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <Link to="/" className="brand">
          Fernweg
        </Link>

        <nav className="nav-links">

          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          {/* Admin Notification */}
          {user?.role === "admin" && (
            <AdminNotificationBell />
          )}

          {/* Cart */}
          <Link to="/cart" className="cart-link">
            🛒

            {itemCount > 0 && (
              <span className="cart-badge">
                {itemCount}
              </span>
            )}
          </Link>

          {/* CUSTOMER MY ORDERS */}
          {user && user.role !== "admin" && (
            <Link to="/orders" className="my-orders-link">
              📦 My Orders
            </Link>
          )}
          {user && user.role !== "admin" && (
          <Link to="/complaints">My Complaints</Link>
          )}

          {/* ADMIN */}
          {user?.role === "admin" && (
            <div className="admin-menu">

              <Link to="/admin" className="admin-user">

                <span className="admin-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>

                <span>
                  Admin
                </span>

                <span className="admin-arrow">
                  ▼
                </span>

              </Link>

              <button
                type="button"
                className="link-btn admin-logout"
                onClick={handleLogout}
              >
                Log out
              </button>

            </div>
          )}

          {/* CUSTOMER */}
          {user && user.role !== "admin" && (
            <div className="nav-user">

              <span>
                Hi, {user.name?.split(" ")[0]}
              </span>

              <button
                type="button"
                className="link-btn"
                onClick={handleLogout}
              >
                Log out
              </button>

            </div>
          )}

          {/* NOT LOGGED IN */}
          {!user && (
            <div className="nav-auth">

              <Link
                to="/login"
                className="btn-outline"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary"
              >
                Register
              </Link>

            </div>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Navbar;