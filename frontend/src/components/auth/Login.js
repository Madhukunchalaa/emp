import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Box, Paper } from '@mui/material';
import { login } from '../../store/slices/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await dispatch(login(formData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left Side - Professional Illustration */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative',
            color: 'white',
          }}
        >
          {/* Simple geometric decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 60,
              height: 60,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              transform: 'rotate(45deg)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 30,
              left: 30,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          
          {/* Main Content */}
          <Box sx={{ textAlign: 'center', zIndex: 2 }}>
            {/* Professional Icon */}
            <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mb: 4,
            }}
          >
            <img
              src="/smartsolutions-logo.png" 
              alt="Smart Solutions Logo"
              style={{
                width: '100%',
                height: '140px',
                color:"white",
                objectFit: 'contain',
                marginBottom: '12px',
              }}
            />
          </Box>


            <p style={{ 
              opacity: 0.9, 
              fontSize: '1.1rem', 
              lineHeight: 1.5,
              fontWeight: '400',
              maxWidth: '260px',
              margin: '0 auto'
            }}>
              Your trusted gateway to professional dashboard and analytics
            </p>
          </Box>
        </Box>

        {/* Right Side - Clean Form */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'white',
          }}
        >
          <div className="mb-4 text-center">
            <h3 
              className="fw-semibold mb-2" 
              style={{ 
                color: '#1f2937', 
                fontSize: '2rem',
                letterSpacing: '-0.01em'
              }}
            >
              Welcome Back
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '1rem', color: '#6b7280' }}>
              Please sign in to your account
            </p>
          </div>

          {error && (
            <Alert 
              severity="error" 
              className="mb-4"
              sx={{
                borderRadius: '12px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium mb-2" style={{ color: '#374151', fontSize: '0.9rem' }}>
                Email Address
              </label>
              <div className="position-relative">
                <div 
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: '14px', zIndex: 3 }}
                >
                  <i className="bi bi-envelope" style={{ color: '#ff6b35', fontSize: '16px' }}></i>
                </div>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={{
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '0.95rem',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b35';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-medium mb-2" style={{ color: '#374151', fontSize: '0.9rem' }}>
                Password
              </label>
              <div className="position-relative">
                <div 
                  className="position-absolute top-50 translate-middle-y"
                  style={{ left: '14px', zIndex: 3 }}
                >
                  <i className="bi bi-lock" style={{ color: '#ff6b35', fontSize: '16px' }}></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    paddingLeft: '44px',
                    paddingRight: '50px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '0.95rem',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b35';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  className="position-absolute top-50 translate-middle-y border-0 bg-transparent"
                  style={{ right: '14px', color: '#9ca3af', fontSize: '16px' }}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="remember"
                  style={{ 
                    accentColor: '#ff6b35',
                    width: '16px',
                    height: '16px'
                  }}
                />
                <label htmlFor="remember" className="form-check-label ms-2" style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Remember me
                </label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-decoration-none fw-medium"
                style={{ 
                  color: '#ff6b35',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease'
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn w-100 mb-4 fw-medium"
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '1rem',
                color: 'white',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.25)';
              }}
            >
              Sign In
            </button>

            <div className="text-center">
              <span className="text-muted" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Don't have an account? 
              </span>
              <Link 
                to="/register" 
                className="fw-medium text-decoration-none ms-1"
                style={{ 
                  color: '#ff6b35',
                  fontSize: '0.9rem'
                }}
              >
                Sign up
              </Link>
            </div>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;