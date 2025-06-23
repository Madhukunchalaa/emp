import React from 'react';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import DesignerDashboard from './DesignerDashboard';
import BusinessDashboard from './BusinessDashboard';

const DynamicDashboard = () => {
  const userRole = localStorage.getItem('userRole'); // This will be lowercase from authSlice

  console.log('DynamicDashboard - User role from localStorage:', userRole);

  switch (userRole) {
    case 'manager':
      console.log('Rendering ManagerDashboard');
      return <ManagerDashboard />;
    case 'employee':
    case 'developer':
      console.log('Rendering EmployeeDashboard');
      return <EmployeeDashboard />;
    case 'designer':
      console.log('Rendering DesignerDashboard');
      return <DesignerDashboard />;
    case 'business':
      console.log('Rendering BusinessDashboard');
      return <BusinessDashboard />;
    default:
      console.log(`No valid role found ('${userRole}'), showing a fallback.`);
      // It's better to show a loading or error message than a wrong dashboard.
      return <div>Loading dashboard... If you are not redirected, please login again.</div>; 
  }
};

export default DynamicDashboard; 