import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state) => state.auth.user);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default RoleBasedRoute;
