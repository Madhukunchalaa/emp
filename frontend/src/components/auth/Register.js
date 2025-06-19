import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper
} from '@mui/material';
import { register } from '../../store/slices/authSlice';
import { authService } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer'
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call the register endpoint to send OTP
      const response = await authService.register(formData);
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.verifyRegistrationOTP(formData.email, otp);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Registration successful! Please login.' }
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(formData);
      setSuccess('OTP resent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderRegistrationForm = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          name="role"
          value={formData.role}
          label="Role"
          onChange={handleChange}
        >
          <MenuItem value="developer">Developer</MenuItem>
          <MenuItem value="designer">Designer</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="Business">Business Development</MenuItem>
        </Select>
      </FormControl>
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
      <Typography align="center" sx={{ mt: 2 }}>
        <Link to="/login" style={{ textDecoration: 'none', color:'#4361ee'}}>
          Already have an account? Sign in
        </Link>
      </Typography>
    </Box>
  );

  const renderOTPVerification = () => (
    <Box component="form" onSubmit={handleVerifyOTP}>
      <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
        Enter the 6-digit code sent to {formData.email}
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        label="OTP Code"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputProps={{ 
          maxLength: 6,
          style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
        }}
        placeholder="Enter 6-digit code"
      />
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ mt: 3 }}
        disabled={loading || otp.length !== 6}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={handleResendOTP}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Resend OTP
        </Button>
        <Button
          variant="text"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Back to Registration
        </Button>
      </Box>
    </Box>
  );

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
        {/* Left Side - Illustration */}
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
        <Box sx={{ flex: 1, p: 4, backgroundColor: '#fff' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {step === 1 ? 'Register Now' : 'Verify OTP'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {step === 1 ? renderRegistrationForm() : renderOTPVerification()}
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
