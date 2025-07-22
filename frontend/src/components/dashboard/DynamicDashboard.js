import React from 'react';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
// import DesignerDashboard from './DesignerDashboard';
import BusinessDashboard from './BusinessDashboard';
import TeamLeaderDashboard from './TeamLeaderDashboard';

const DynamicDashboard = () => {
  const userRole = localStorage.getItem('userRole'); // should be lowercase

  switch (userRole) {
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    case 'developer':
      return <EmployeeDashboard />;
    case 'designer':
      return <EmployeeDashboard />;
    case 'business':
      return <BusinessDashboard />;
    case 'team-leader':
      return <TeamLeaderDashboard />;
    default:
      return <div>Loading dashboard... If you are not redirected, please login again.</div>;
  }
};

export default DynamicDashboard;