import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Box, Paper } from '@mui/material';
import { authService } from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
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
      const response = await authService.verifyOTP(email, otp);
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(email, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess('OTP resent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="p-4">
      <div className="mb-4 text-center">
        <h3 className="fw-bold">🔐 Forgot Password</h3>
        <p className="text-muted small mb-0">Enter your email to receive a reset code</p>
      </div>

      {error && <Alert severity="error" className="mb-3">{error}</Alert>}
      {success && <Alert severity="success" className="mb-3">{success}</Alert>}

      <form onSubmit={handleSendOTP}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending OTP...
            </>
          ) : (
            'Send Reset Code'
          )}
        </button>

        <div className="text-center small">
          Remember your password?{' '}
          <Link to="/login" className="fw-bold text-decoration-none">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="p-4">
      <div className="mb-4 text-center">
        <h3 className="fw-bold">📧 Verify OTP</h3>
        <p className="text-muted small mb-0">Enter the 6-digit code sent to {email}</p>
      </div>

      {error && <Alert severity="error" className="mb-3">{error}</Alert>}
      {success && <Alert severity="success" className="mb-3">{success}</Alert>}

      <form onSubmit={handleVerifyOTP}>
        <div className="mb-3">
          <label htmlFor="otp" className="form-label">OTP Code</label>
          <input
            type="text"
            className="form-control text-center"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength="6"
            style={{ fontSize: '1.2rem', letterSpacing: '0.5rem' }}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mb-3"
          disabled={loading || otp.length !== 6}
          style={{
            background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={handleResendOTP}
            disabled={loading}
          >
            Didn't receive code? Resend
          </button>
        </div>

        <div className="text-center small mt-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() => setStep(1)}
          >
            ← Back to Email
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="p-4">
      <div className="mb-4 text-center">
        <h3 className="fw-bold">🔑 Reset Password</h3>
        <p className="text-muted small mb-0">Create a new password for your account</p>
      </div>

      {error && <Alert severity="error" className="mb-3">{error}</Alert>}
      {success && <Alert severity="success" className="mb-3">{success}</Alert>}

      <form onSubmit={handleResetPassword}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
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

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <div className="input-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 mb-3"
          disabled={loading || !newPassword || !confirmPassword}
          style={{
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>

        <div className="text-center small">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() => setStep(2)}
          >
            ← Back to OTP
          </button>
        </div>
      </form>
    </div>
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
          maxWidth: '500px',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Header with illustration */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
            color: 'white',
            padding: 3,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {step === 1 ? '🔐' : step === 2 ? '📧' : '🔑'}
          </div>
          <h4 style={{ margin: 0, fontWeight: 'bold' }}>
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
          </h4>
        </Box>

        {/* Progress indicator */}
        <div className="bg-light p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <small>Email</small>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <small>OTP</small>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <small>Password</small>
            </div>
          </div>
        </div>

        {/* Form content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Paper>

      <style jsx>{`
        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        
        .step-indicator.active {
          opacity: 1;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #dee2e6;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        .step-indicator.active .step-number {
          background: #3a0ca3;
          color: white;
        }
        
        .step-line {
          flex: 1;
          height: 2px;
          background: #dee2e6;
          margin: 0 1rem;
          margin-top: 15px;
        }
        
        .step-line.active {
          background: #3a0ca3;
        }
      `}</style>
    </Box>
  );
};

export default ForgotPassword; 