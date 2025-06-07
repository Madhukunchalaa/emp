import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect based on user role
  if (user) {
    const currentPath = location.pathname;
    
    if (user.role === 'manager' && currentPath !== '/manager-dashboard') {
      return <Navigate to="/manager-dashboard" replace />;
    }
    
    if (user.role === 'designer' && currentPath !== '/designer-dashboard') {
      return <Navigate to="/designer-dashboard" replace />;
    }
    
    if (user.role === 'employee' && currentPath !== '/dashboard') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 