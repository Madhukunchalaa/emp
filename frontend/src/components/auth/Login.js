import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper
} from '@mui/material';
import { login } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        case 'developer':
        default:
          navigate('/dashboard');
          break;
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
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
            bgcolor: 'blue',
            color: 'white',
            p: 2,
            mb: 3,
            borderRadius: '0 100px 0 100px',
            boxShadow: '15px 15px 25px black',
            fontWeight: 'bold'
          }}
        >
          Login Form Javascript Validation
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: '150px 0 150px 0',
            border: '2px solid blue',
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
                bgcolor: 'blue',
                color: 'white',
                borderRadius: '50px 0 50px 0',
                px: 4,
                py: 1,
                mb: 1,
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
                bgcolor: 'blue',
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
                bgcolor: 'white',
                color: 'black',
                border: '2px solid blue',
                borderRadius: '50px 0 50px 0',
                fontWeight: 'bold',
                boxShadow: '9px 9px 25px black',
                '&:hover': {
                  bgcolor: '#e1ffe1',
                  borderColor: 'red',
                }
              }}
            >
              Login
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Don’t have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Animations */}
      <style>
        {`
        @keyframes slideIn {
          0% { transform: translateX(210px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes boxSlide {
          0% { transform: translateX(-210px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        `}
      </style>
    </Container>
  );
};

export default Login;
