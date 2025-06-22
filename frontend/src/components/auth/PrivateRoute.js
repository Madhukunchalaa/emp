import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * @param {ReactNode} children - The component to render.
 * @param {string[]} allowedRoles - Optional list of roles allowed to access this route.
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in? Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role not allowed? Redirect to unauthorized
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Redirect based on user role to correct dashboard
  const currentPath = location.pathname;
  switch (user?.role) {
    case 'manager':
      if (currentPath !== '/manager-dashboard') {
        return <Navigate to="/manager-dashboard" replace />;
      }
      break;
    case 'designer':
    case 'developer':
    case 'Business':
      if (currentPath !== '/dashboard') {
        return <Navigate to="/dashboard" replace />;
      }
      break;
    default:
      return <Navigate to="/login" replace />;
  }

  // Everything ok — render children
  return children;
};

export default PrivateRoute;
