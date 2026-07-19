import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isHost } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/my-plan', label: 'My Plan' },
    { path: '/map', label: 'Map' },
    { path: '/rewards', label: 'Rewards' },
    { path: '/buddy', label: 'Buddy' },
    { path: '/memory-reel', label: 'Memory Reel' },
    { path: '/leaderboard', label: 'Leaderboard' },
    ...(isHost ? [{ path: '/host', label: 'Host' }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : [])
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backdropFilter: 'blur(8px)',
      background: 'linear-gradient(180deg, #0b0d12cc, #0b0d1200)',
      borderBottom: '1px solid #ffffff10',
      animation: 'fadeInDown 0.6s ease-out'
    }}>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nav-item {
          position: relative;
          transition: color 0.3s ease;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--brand), var(--brand-2));
          transition: width 0.3s ease;
        }
        .nav-item.active::after {
          width: 100%;
        }
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu {
            display: none !important;
          }
        }
      `}</style>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', gap: '10px', alignItems: 'center', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'conic-gradient(from 120deg, #7c9cff, #b488ff, #6af2c6)',
            boxShadow: '0 6px 18px #6a89ff55',
            transition: 'transform 0.3s ease',
            animation: 'float 3s ease-in-out infinite'
          }}></div>
          <div style={{ fontWeight: 800, letterSpacing: '.2px', display: 'none' }} className="logoText" >FestifyXR</div>
          <span className="pill" style={{ display: 'none' }}>Festival Companion</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`btn nav-item ${isActive(link.path) ? 'active' : 'ghost'}`} 
              style={{ position: 'relative' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="nav-mobile-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          ☰
        </button>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 156, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c9cff, #6af2c6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#0b0d12',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '14px' }}>{user?.name?.split(' ')[0]}</span>
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              background: 'var(--card)',
              border: '1px solid #ffffff20',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              minWidth: '200px',
              zIndex: 1000,
              animation: 'fadeInUp 0.3s ease-out'
            }}>
              <div style={{ padding: '12px', borderBottom: '1px solid #ffffff10', fontSize: '14px', color: '#adb6d9' }}>
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 93, 108, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                LogOut
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(16, 20, 32, 0.95)',
          borderTop: '1px solid #ffffff10',
          padding: '12px',
          gap: '8px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`btn ${isActive(link.path) ? '' : 'ghost'}`}
              onClick={() => setShowMobileMenu(false)}
              style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

Navbar.propTypes = {
  // Component doesn't accept props, but defining this for completeness
};

