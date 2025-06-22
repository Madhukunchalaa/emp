import React, { useEffect } from 'react';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import DesignerDashboard from './DesignerDashboard';
import BusinessDashboard from './BusinessDashboard';
import { authService } from '../../services/api';

const DynamicDashboard = () => {
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  let userRole = localStorage.getItem('userRole'); // Try direct role storage first
  
  // If no direct role storage, try to extract from user data
  if (!userRole && userData) {
    try {
      const user = JSON.parse(userData);
      userRole = user.role;
      console.log('Extracted role from user data:', userRole);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  console.log('DynamicDashboard - User data:', userData);
  console.log('DynamicDashboard - User role:', userRole);
  console.log('DynamicDashboard - Direct userRole from localStorage:', localStorage.getItem('userRole'));

  // Test function to check current user from backend
  useEffect(() => {
    const testUserRole = async () => {
      try {
        const response = await authService.getCurrentUser();
        console.log('Backend user data:', response.data);
        console.log('Backend user role:', response.data.user.role);
        
        // Update localStorage if there's a mismatch
        if (response.data.user.role !== userRole) {
          console.log('Role mismatch detected! Backend:', response.data.user.role, 'Frontend:', userRole);
          localStorage.setItem('userRole', response.data.user.role);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          // Force reload to apply the correct role
          window.location.reload();
        }
      } catch (error) {
        console.error('Error testing user role:', error);
      }
    };

    // Only test if we have a token
    if (localStorage.getItem('token')) {
      testUserRole();
    }
  }, [userRole]);

  switch (userRole) {
    case 'manager':
    case 'Manager':
    case 'MANAGER':
      console.log('Rendering ManagerDashboard');
      return <ManagerDashboard />;
    case 'employee':
    case 'Employee':
    case 'EMPLOYEE':
    case 'developer':
    case 'Developer':
    case 'DEVELOPER':
    case 'designer':
    case 'Designer':
    case 'DESIGNER':
      console.log('Rendering EmployeeDashboard');
      return <EmployeeDashboard />;
    case 'Business':
    case 'business':
    case 'BUSINESS':
      console.log('Rendering BusinessDashboard');
      return <BusinessDashboard />;
    default:
      console.log('No valid role found, defaulting to EmployeeDashboard');
      console.log('Available roles in localStorage:', {
        userRole: localStorage.getItem('userRole'),
        user: localStorage.getItem('user')
      });
      return <EmployeeDashboard />; // Default to employee dashboard
  }
};

export default DynamicDashboard; 