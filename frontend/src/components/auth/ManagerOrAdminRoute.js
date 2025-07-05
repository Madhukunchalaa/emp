import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ManagerOrAdminRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ManagerOrAdminRoute; 