import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert,Box,Paper } from '@mui/material';
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
      switch (result.user.role) {
        case 'manager':
          navigate('/manager-dashboard');
          break;
        case 'designer':
          navigate('/designer-dashboard');
          break;
        case 'Business':
          navigate('/business-dashboard');
        break;
        
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0e4ff, #e4e9ff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
   <Box
          sx={{
            flex: 1,
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
          }}
        >
          <img
            src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?semt=ais_hybrid&w=740"
            alt="Illustration"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              borderRadius: '10px',
            }}
          />
        </Box>

          {/* Right Side - Form */}
          <div className="col-md-6 p-5">
            <div className="mb-4 text-center">
              <h3 className="fw-bold">Sign In</h3>
              <p className="text-muted small mb-0">Login to your account</p>
            </div>

            {error && <Alert severity="error" className="mb-3">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                 <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="remember" />
                  <label htmlFor="remember" className="form-check-label small text-muted">
                    Remember Me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-decoration-none small">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Sign In
              </button>

              <div className="text-center small">
                Don’t have an account?{' '}
                <Link to="/register" className="fw-bold text-decoration-none">
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </Paper>
    </Box>
  );
};


export default Login;