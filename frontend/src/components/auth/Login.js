import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
import { login } from '../../store/slices/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="row g-0 shadow-lg rounded-4 overflow-hidden bg-white">
          {/* Left Side */}
          <div className="col-md-6 d-flex flex-column justify-content-center text-white p-5"
               style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
            <h2 className="fw-bold mb-3">Welcome</h2>
            <h5 className="mb-3 fw-light">Your Workspace Portal</h5>
            <p className="mb-4 small" style={{ opacity: 0.85 }}>
              Access your dashboard, manage projects and collaborate efficiently.
            </p>
            <ul className="list-unstyled small">
              <li className="mb-2"><i className="bi bi-people-fill me-2" /> Team Collaboration</li>
              <li className="mb-2"><i className="bi bi-graph-up me-2" /> Project Management</li>
              <li><i className="bi bi-shield-check me-2" /> Secure Access</li>
            </ul>
          </div>

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
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-envelope text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
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
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-lock text-muted" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
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
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: `'Poiret One', cursive`,
          letterSpacing: '2px',
          animation: 'slideIn 1s ease',
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{
            width: '100%',
            bgcolor: '#7353ae',
            color: 'white',
            p: 2,
            mb: 3,
            borderRadius: '0 100px 0 100px',
            boxShadow: '15px 15px 25px black',
            fontWeight: 'bold'
          }}
        >
          Login Form
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: '150px 0 150px 0',
            border: '2px solid #7353ae',
            boxShadow: '9px 9px 25px black',
            animation: 'boxSlide 1s ease',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              component="label"
              sx={{
                display: 'block',
                bgcolor: '#7353ae',
                color: 'white',
                borderRadius: '50px 0 50px 0',
                px: 4,
                py: 1,
                mb: 1,
                mx:3,
                boxShadow: '9px 9px 25px black',
                width: 'fit-content',
              }}
            >
              Username
            </Box>
            <TextField
              name="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 3,
                borderRadius: '30px 0 30px 0',
                boxShadow: '9px 9px 25px black',
                '& .MuiOutlinedInput-root': {
                  px: 2,
                },
                '& .Mui-focused fieldset': {
                  borderColor: 'red',
                }
              }}
            />

            <Box
              component="label"
              sx={{
                display: 'block',
                bgcolor: '#7353ae',
                color: 'white',
                borderRadius: '50px 0 50px 0',
                px: 4,
                py: 1,
                mb: 1,
                boxShadow: '9px 9px 25px black',
                width: 'fit-content',
              }}
            >
              Password
            </Box>
            <TextField
              name="password"
              type="password"
              required
              fullWidth
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                borderRadius: '30px 0 30px 0',
                boxShadow: '9px 9px 25px black',
                '& .MuiOutlinedInput-root': {
                  px: 2,
                },
                '& .Mui-focused fieldset': {
                  borderColor: 'red',
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: '#7353ae',
                color: 'white',
                // border: '2px solid #7353ae',
                borderRadius: '50px 0 50px 0',
                fontWeight: 'bold',
                boxShadow: '9px 9px 25px black',
                '&:hover': {
                  bgcolor: '#7353ae',
                  // borderColor: 'red',
                }
              }}
            >
              Login
            </Button>


              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Sign In
              </button>

              <button type="button" className="btn btn-outline-dark w-100 mb-3 rounded-2">
                Sign in with Other
              </button>

              <div className="text-center small">
                Don’t have an account?{' '}
                <Link to="/register" className="fw-bold text-decoration-none">
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
