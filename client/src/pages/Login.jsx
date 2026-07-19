import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginAPI, signup as signupAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm, validateSignupForm } from '../utils/validators';
import { showToast } from '../utils/toast';
import '../index.css';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant',
    adminPasskey: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      let validation;
      if (isSignup) {
        validation = validateSignupForm(formData.name, formData.email, formData.password);
      } else {
        validation = validateLoginForm(formData.email, formData.password);
      }

      if (!validation.valid) {
        setErrors(validation.errors);
        showToast.error('Please fix the errors below');
        setLoading(false);
        return;
      }

      // Make API request
      let response;
      if (isSignup) {
        response = await signupAPI(formData);
        showToast.success('Account created! Logging you in...');
      } else {
        response = await loginAPI({ email: formData.email, password: formData.password });
        showToast.success('Login successful!');
      }

      if (response.data.success) {
        // Handle new token structure with accessToken and refreshToken
        const tokens = response.data.tokens || { accessToken: response.data.token };
        login(response.data.user, tokens);
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(1000px 600px at 10% -10%, #1d2340 0%, #0b0d12 60%)',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', margin: '20px' }}>
        <div style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              background: 'conic-gradient(from 120deg, #7c9cff, #b488ff, #6af2c6)',
              boxShadow: '0 6px 18px #6a89ff55',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px', animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>FestifyXR</h1>
            <p style={{ color: '#adb6d9', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
              {isSignup ? 'Create your account' : 'Welcome back!'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                  style={errors.name ? { borderColor: '#ff5d6c', background: 'rgba(255, 93, 108, 0.05)' } : {}}
                />
                {errors.name && (
                  <div style={{ fontSize: '12px', color: '#ff5d6c', marginTop: '6px' }}>
                    {errors.name}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                style={errors.email ? { borderColor: '#ff5d6c', background: 'rgba(255, 93, 108, 0.05)' } : {}}
              />
              {errors.email && (
                <div style={{ fontSize: '12px', color: '#ff5d6c', marginTop: '6px' }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                minLength="6"
                style={errors.password ? { borderColor: '#ff5d6c', background: 'rgba(255, 93, 108, 0.05)' } : {}}
              />
              {errors.password && (
                <div style={{ fontSize: '12px', color: '#ff5d6c', marginTop: '6px' }}>
                  {errors.password}
                </div>
              )}
            </div>

            {isSignup && (
              <div style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="participant">Participant</option>
                  <option value="host">Host</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {isSignup && formData.role === 'admin' && (
              <div style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out 0.65s both' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Admin Passkey <span style={{ color: '#ff5d6c' }}>*</span>
                </label>
                <input
                  type="password"
                  name="adminPasskey"
                  value={formData.adminPasskey}
                  onChange={handleChange}
                  className={`input ${errors.adminPasskey ? 'error' : ''}`}
                  placeholder="Enter admin passkey"
                  style={errors.adminPasskey ? { borderColor: '#ff5d6c', background: 'rgba(255, 93, 108, 0.05)' } : {}}
                />
                {errors.adminPasskey && (
                  <div style={{ fontSize: '12px', color: '#ff5d6c', marginTop: '6px' }}>
                    {errors.adminPasskey}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#adb6d9', marginTop: '6px' }}>
                  ℹ️ Admin passkey is required to create an admin account
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', animation: 'fadeInUp 0.6s ease-out 0.7s both' }} 
              disabled={loading}
            >
              {loading ? '⏳ Please wait...' : (isSignup ? '✓ Create Account' : '→ Login')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#adb6d9', animation: 'fadeInUp 0.6s ease-out 0.8s both' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsSignup(!isSignup);
                setErrors({});
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#7c9cff', 
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 'inherit'
              }}
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
