import React from 'react';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import BusinessDashboard from './BusinessDashboard';
import TeamLeaderDashboard from './TeamLeaderDashboard';
import ManagerSidebar from '../common/ManagerSidebar';
import EmployeeSidebar from '../common/EmployeeSidebar';

const DynamicDashboard = () => {
  const userRole = localStorage.getItem('userRole'); // should be lowercase

  switch (userRole) {
    case 'manager':
      return (
        <ManagerSidebar>
          <ManagerDashboard />
        </ManagerSidebar>
      );
    case 'employee':
    case 'developer':
    case 'designer':
    case 'digital-marketing':
      return (
        <EmployeeSidebar>
          <EmployeeDashboard />
        </EmployeeSidebar>
      );
    case 'business':
      return <BusinessDashboard />;
    case 'team-leader':
      return <TeamLeaderDashboard />;
    default:
      return <div>Loading dashboard... If you are not redirected, please login again.</div>;
  }
};

export default DynamicDashboard;