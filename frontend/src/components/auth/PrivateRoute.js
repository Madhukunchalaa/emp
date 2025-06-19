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
    
    switch (user.role) {
      case 'manager':
        if (currentPath !== '/manager-dashboard') {
          return <Navigate to="/manager-dashboard" replace />;
        }
        break;
      case 'designer':
        if (currentPath !== '/dashboard') {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'developer':
        if (currentPath !== '/dashboard') {
          return <Navigate to="/dashboard" replace />;
        }
        break;
         case 'Business':
        if (currentPath !== '/dashboard') {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 