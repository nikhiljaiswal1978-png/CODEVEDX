import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  User,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const NavItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `nav-item ${isActive ? "active" : ""}`
    }
  >
    <Icon size={18} />
    {children}
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Sparkles size={18} />
          </div>

          <div>
            <div className="logo-title">PM Tool</div>
            <div className="logo-subtitle">Productivity Suite</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/" icon={LayoutDashboard}>
            Dashboard
          </NavItem>

          <NavItem to="/projects" icon={FolderKanban}>
            Projects
          </NavItem>

          <NavItem to="/tasks" icon={CheckSquare}>
            My Tasks
          </NavItem>

          <NavItem to="/analytics" icon={BarChart3}>
            Analytics
          </NavItem>

          {isAdmin && (
            <NavItem to="/users" icon={Users}>
              Users
            </NavItem>
          )}

          <NavItem to="/profile" icon={User}>
            Profile
          </NavItem>
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <button className="sidebar-button" onClick={toggle}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? "Light mode" : "Dark mode"}
          </button>

          <button className="sidebar-button" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-area">
        <header className="top-header">
          <div className="welcome">
            Welcome back,{" "}
            <span className="user-name">{user?.name}</span>
          </div>

          <div className="header-right">
            <span className="role-badge">{user?.role}</span>

            <div className="avatar">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}