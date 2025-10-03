import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Navigation.css";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Hide nav on landing page when not authenticated
  if (location.pathname === "/" && !isAuthenticated()) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">EduPlatform</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {isAuthenticated() ? (
            <>
              <span className="nav-user-info">
                Welcome, {user?.name} ({user?.role})
              </span>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/" && (
                <Link to="/" className="nav-link">
                  Home
                </Link>
              )}
              <Link to="/signup" className="nav-link signup-btn">
                Sign Up
              </Link>
              <Link to="/login" className="nav-link login-btn">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated() ? (
            <>
              <div className="mobile-user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <Link 
                to="/dashboard" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout} 
                className="mobile-nav-link logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/" && (
                <Link 
                  to="/" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              )}
              <Link 
                to="/signup" 
                className="mobile-nav-link signup-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
              <Link 
                to="/login" 
                className="mobile-nav-link login-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;