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
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../store/slices/authSlice';
import { authService } from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',

    role: 'developer',

    empid: '',
    profileImage: null
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        empid: formData.empid
      };

      // Call the register endpoint to send OTP
      const response = await authService.register(registrationData);
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
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        empid: formData.empid
      };

      const response = await authService.register(registrationData);
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
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        label="Employee ID"
        name="empid"
        value={formData.empid}
        onChange={handleChange}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
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
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{ color: '#9ca3af' }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
      />

      <FormControl 
        fullWidth 
        margin="normal"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
      >
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
        disabled={loading}
        sx={{
          mt: 2,
          mb: 3,
          py: 1.5,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f7931e 0%, #ff6b35 100%)',
            boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: '#d1d5db',
            color: '#9ca3af',
          },
        }}
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
      
      <Typography align="center" sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Already have an account?{' '}
        <Link 
          to="/login" 
          style={{ 
            textDecoration: 'none', 
            color: '#ff6b35',
            fontWeight: 500
          }}
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  );

  const renderOTPVerification = () => (
    <Box component="form" onSubmit={handleVerifyOTP}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 107, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <i className="bi bi-envelope-check" style={{ fontSize: '32px', color: '#ff6b35' }}></i>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
          Check Your Email
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Enter the 6-digit code sent to<br />
          <strong>{formData.email}</strong>
        </Typography>
      </Box>
      
      <TextField
        margin="normal"
        required
        fullWidth
        label="OTP Code"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputProps={{ 
          maxLength: 6,
          style: { 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            letterSpacing: '0.5rem',
            fontWeight: 600
          }
        }}
        placeholder="000000"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ff6b35',
          },
        }}
      />
      
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        disabled={loading || otp.length !== 6}
        sx={{
          mb: 3,
          py: 1.5,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f7931e 0%, #ff6b35 100%)',
            boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: '#d1d5db',
            color: '#9ca3af',
          },
        }}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      
      <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="text"
          onClick={handleResendOTP}
          disabled={loading}
          sx={{
            color: '#ff6b35',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
            },
          }}
        >
          Resend OTP
        </Button>
        <Button
          variant="text"
          onClick={() => setStep(1)}
          disabled={loading}
          sx={{
            color: '#6b7280',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
            },
          }}
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
            {/* Lotus Logo */}
            <Box
              sx={{
                mb: 3,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
               <img
              src="/smartsolutions-logo.png"
              alt="Smart Solutions Logo"
              style={{
              width: '80%',
              height: '140px',
              objectFit: 'contain',
              marginBottom: '12px',
            }}
          />
            </Box>
            
            </Box>

<h2 style={{ 
  fontWeight: '500', 
  marginBottom: '8px',
  fontFamily: `'Brush Script MT', cursive`, // Elegant cursive 
  fontSize: '2.2rem',
  color: 'white',
  letterSpacing: '-0.01em'
}}>
  {step === 1 ? 'Join Our Team Smart Solutions' : 'Almost There!'}
</h2>

<p style={{ 
  fontFamily: `'Brush Script MT', cursive`, // Elegant cursive
  color: '#000',
  fontSize: '1.5rem',
  lineHeight: 1.5,
  fontWeight: '500',
  maxWidth: '300px',
  margin: '0 auto',
  textAlign: 'center',
  opacity: 0.95
}}>
  "We don’t just follow trends. We set them"
</p>



          </Box>
        
        {/* Right Side - Form */}
        <Box sx={{ flex: 1, p: { xs: 4, md: 5 }, backgroundColor: 'white' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 600, 
                color: '#1f2937',
                fontSize: '2rem',
                letterSpacing: '-0.01em',
                mb: 1
              }}
            >
              {step === 1 ? 'Create Account' : 'Verify OTP'}
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '1rem' }}>
              {step === 1 
                ? 'Fill in your details to get started' 
                : 'Enter the verification code we sent you'
              }
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
              }}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
              }}
            >
              {success}
            </Alert>
          )}

          {step === 1 ? renderRegistrationForm() : renderOTPVerification()}
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;


