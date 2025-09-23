import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import { ChatNotificationContext } from './components/common/Navbar';
import Navbar from './components/common/Navbar';
import ManagerSidebar from './components/common/ManagerSidebar';

// Auth and Dashboard Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';

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
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);
  
  // Manager routes that should use sidebar
  const managerRoutes = [
    '/dashboard', '/team', '/projects', '/reports', '/assign-project', 
    '/assign-task', '/manager-leave', '/attendance-calendar', '/website-health-monitor', '/chat'
  ];
  const isManagerRoute = managerRoutes.includes(location.pathname);

  return (
    <ChatNotificationContext.Provider value={{ unreadMessages, setUnreadMessages, chatOpenWith, setChatOpenWith }}>
      {!hideNavbar && !isManagerRoute && <Navbar />}
      {!hideNavbar && isManagerRoute ? (
        <ManagerSidebar>
          <Routes>
            {/* Manager Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ManagerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/team"
              element={
                <PrivateRoute>
                  <Team />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/assign-project"
              element={
                <PrivateRoute>
                  <AssignProject />
                </PrivateRoute>
              }
            />
            <Route
              path="/assign-task"
              element={
                <PrivateRoute>
                  <AssignTask />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager-leave"
              element={
                <PrivateRoute>
                  <ManagerLeave />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/website-health-monitor"
              element={
                <PrivateRoute>
                  <WebsiteHealthMonitor />
                </PrivateRoute>
              }
            />
            <Route path="/attendance-calendar" element={<PrivateRoute><AttendanceCalendar /></PrivateRoute>} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </ManagerSidebar>
      ) : (
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

          {/* Manager Routes */}
          <Route
            path="/manager-dashboard"
            element={
              <PrivateRoute>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/assign-project"
            element={
              <PrivateRoute>
                <AssignProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/assign-task"
            element={
              <PrivateRoute>
                <AssignTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager-leave"
            element={
              <PrivateRoute>
                <ManagerLeave />
              </PrivateRoute>
            }
          />
  <Route
  path="/project/:id"
  element={
    <PrivateRoute>
      <ProjectDetails />
    </PrivateRoute>
  }
/>
          




          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/admin/empid" element={<EmpIdAdmin />} />
          <Route path="/team-management" element={<PrivateRoute><TeamManagement /></PrivateRoute>} />
          <Route path="/team-tasks" element={<PrivateRoute><TeamTasks /></PrivateRoute>} />
          <Route path="/team-reports" element={<PrivateRoute><TeamReports /></PrivateRoute>} />
          <Route
            path="/website-health-monitor"
            element={
              <PrivateRoute>
                <WebsiteHealthMonitor />
              </PrivateRoute>
            }
          />
          <Route path="/attendance-calendar" element={<PrivateRoute><AttendanceCalendar /></PrivateRoute>} />
          <Route path="/assign-team-task" element={<PrivateRoute><AssignProjectToTeamLeader /></PrivateRoute>} />

          {/* Employee Routes */}
          <Route path="/my-tasks" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
          <Route path="/my-projects" element={<PrivateRoute><MyProjects /></PrivateRoute>} />
          <Route path="/work-updates" element={<PrivateRoute><WorkUpdates /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/Leave" element={<PrivateRoute><Leave /></PrivateRoute>} />

          {/* Business Routes */}
          <Route path="/opportunities" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/leads" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/proposals" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><DynamicDashboard /></PrivateRoute>} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
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