import React from 'react';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
<<<<<<< HEAD
import DesignerDashboard from './DesignerDashboard';
=======
// import DesignerDashboard from './DesignerDashboard';
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
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
<<<<<<< HEAD
      return <DesignerDashboard />;
=======
      return <EmployeeDashboard />;
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
    case 'business':
      return <BusinessDashboard />;
    case 'team-leader':
      return <TeamLeaderDashboard />;
    default:
      return <div>Loading dashboard... If you are not redirected, please login again.</div>;
  }
};

export default DynamicDashboard;