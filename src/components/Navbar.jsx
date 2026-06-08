import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Wrench,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropOpen(false);
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🛋️</span>
          <span>RentEase</span>
        </Link>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={isActive("/")}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={isActive("/products")}
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/products?category=Furniture"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Furniture
          </Link>
          <Link
            to="/products?category=Appliances"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Appliances
          </Link>
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setDropOpen(!dropOpen)}
              >
                <User size={18} />
                <span>{user.name.split(" ")[0]}</span>
              </button>
              {dropOpen && (
                <div className="dropdown">
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        className="drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/products"
                        className="drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <Package size={16} /> Manage Products
                      </Link>
                      <Link
                        to="/admin/maintenance"
                        className="drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <Wrench size={16} /> Manage Maintenance
                      </Link>
                      <Link
                        to="/admin/reports"
                        className="drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <LayoutDashboard size={16} /> Reports & Analytics
                      </Link>
                      <Link
                        to="/admin/service-areas"
                        className="drop-item"
                        onClick={() => setDropOpen(false)}
                      >
                        <Package size={16} /> Service Areas
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="drop-item"
                      onClick={() => setDropOpen(false)}
                    >
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>
                  )}
                  <button
                    className="drop-item drop-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
