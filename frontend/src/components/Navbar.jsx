import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import '../styles/company.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // Update state when localStorage changes (after login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };

    // Listen for custom storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on location change
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('user');
    setToken(null);
    setUser({});
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: '28px', marginRight: '8px' }}>🏢</span>
          <span>CompanyHub</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/companies" className={`navbar-link ${isActive('/companies')}`}>
            Companies
          </Link>
          {token && (
            <>
              <Link to="/companies/add" className={`navbar-link ${isActive('/companies/add')}`}>
                Add Company
              </Link>
              <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>
                My Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {token ? (
            <>
              <div className="navbar-user-info">
                <div className="navbar-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="navbar-user-name">
                  {user.name || user.email || 'User'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-logout">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn-nav-primary">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
