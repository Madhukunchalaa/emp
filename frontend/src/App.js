import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import { ChatNotificationContext } from './components/common/Navbar';
import Navbar from './components/common/Navbar';
import ManagerSidebar from './components/common/ManagerSidebar';
import EmployeeSidebar from './components/common/EmployeeSidebar';

// Auth and Dashboard Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';
import ManagerOrAdminRoute from './components/auth/ManagerOrAdminRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Dynamic Dashboard
import DynamicDashboard from './components/dashboard/DynamicDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';

// Manager Components
import ProjectDetails from './components/dashboard/ProjectDetails';
import AssignTask from './components/dashboard/manager-componenets/AssignTask';
import AssignProject from './components/dashboard/manager-componenets/AssignProject';
import AssignProjectToTeamLeader from './components/dashboard/manager-componenets/AssignProjectToTeamLeader';
import Team from './components/dashboard/Team';
import Projects from './components/dashboard/Projects';
import Reports from './components/dashboard/Reports';
import ManagerLeave from './components/dashboard/manager-componenets/ManagerLeave';

// Employee Dashboard Components
import MyTasks from './components/dashboard/MyTasks';
import TaskDetails from './components/dashboard/TaskDetails';
import MyProjects from './components/dashboard/MyProjects';
import WorkUpdates from './components/dashboard/WorkUpdates';
import Attendance from './components/dashboard/Attendance';
import Leave from './components/dashboard/Leave';

import ChatDashboard from './components/dashboard/ChatDashboard';
import EmpIdAdmin from './components/admin/EmpIdAdmin';
import WebsiteHealthMonitor from './components/dashboard/WebsiteHealthMonitor';

import TeamManagement from './components/dashboard/TeamManagement';
import TeamTasks from './components/dashboard/TeamTasks';
import TeamReports from './components/dashboard/TeamReports';
import AttendanceCalendar from './components/dashboard/AttendanceCalendar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const [unreadMessages, setUnreadMessages] = useState({});
  const [chatOpenWith, setChatOpenWith] = useState(null);
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password'];
  // Hide Navbar on all manager and employee dashboard pages
  const managerRoutesNoNavbar = [
    '/manager-dashboard', '/team', '/projects', '/project', '/reports', '/assign-project',
    '/assign-task', '/manager-leave', '/attendance-calendar', '/website-health-monitor', '/chat',
    '/team-management', '/team-tasks', '/team-reports', '/assign-team-task'
  ];
  const employeeRoutesNoNavbar = [
    '/my-tasks', '/task', '/my-projects', '/work-updates', '/attendance', '/Leave'
  ];
  const dashboardRoutesNoNavbar = ['/dashboard'];
  const noNavbarMatch = [...managerRoutesNoNavbar, ...employeeRoutesNoNavbar, ...dashboardRoutesNoNavbar]
    .some(route => location.pathname.startsWith(route));
  const hideNavbar = hideNavbarRoutes.includes(location.pathname) || noNavbarMatch;
  
  return (
    <ChatNotificationContext.Provider value={{ unreadMessages, setUnreadMessages, chatOpenWith, setChatOpenWith }}>
      {!hideNavbar && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dynamic Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DynamicDashboard />
              </PrivateRoute>
            }
          />

          {/* Manager Routes wrapped with ManagerSidebar */}
          <Route
            path="/manager-dashboard"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <ManagerDashboard />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <Team />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <Projects />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <ProjectDetails />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <Reports />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/assign-project"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <AssignProject />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/assign-project/:id"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <AssignProject />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/assign-task"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <AssignTask />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/manager-leave"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <ManagerLeave />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />

          




          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <ChatDashboard />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route path="/admin/empid" element={<EmpIdAdmin />} />
          <Route path="/team-management" element={<PrivateRoute><ManagerSidebar><TeamManagement /></ManagerSidebar></PrivateRoute>} />
          <Route path="/team-tasks" element={<PrivateRoute><ManagerSidebar><TeamTasks /></ManagerSidebar></PrivateRoute>} />
          <Route path="/team-reports" element={<PrivateRoute><ManagerSidebar><TeamReports /></ManagerSidebar></PrivateRoute>} />
          <Route
            path="/website-health-monitor"
            element={
              <PrivateRoute>
                <ManagerSidebar>
                  <WebsiteHealthMonitor />
                </ManagerSidebar>
              </PrivateRoute>
            }
          />
          <Route path="/attendance-calendar" element={<PrivateRoute><ManagerSidebar><AttendanceCalendar /></ManagerSidebar></PrivateRoute>} />
          <Route path="/assign-team-task" element={<PrivateRoute><ManagerSidebar><AssignProjectToTeamLeader /></ManagerSidebar></PrivateRoute>} />

          {/* Employee Routes */}
          <Route path="/my-tasks" element={<PrivateRoute><EmployeeSidebar><MyTasks /></EmployeeSidebar></PrivateRoute>} />
          <Route path="/task/:taskId" element={<PrivateRoute><EmployeeSidebar><TaskDetails /></EmployeeSidebar></PrivateRoute>} />
          <Route path="/my-projects" element={<PrivateRoute><EmployeeSidebar><MyProjects /></EmployeeSidebar></PrivateRoute>} />
          <Route path="/work-updates" element={<PrivateRoute><EmployeeSidebar><WorkUpdates /></EmployeeSidebar></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><EmployeeSidebar><Attendance /></EmployeeSidebar></PrivateRoute>} />
          <Route path="/Leave" element={<PrivateRoute><EmployeeSidebar><Leave /></EmployeeSidebar></PrivateRoute>} />

          {/* Business Routes */}
          <Route path="/opportunities" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/leads" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/proposals" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    </ChatNotificationContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;