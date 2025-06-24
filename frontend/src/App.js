import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';

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
import Team from './components/dashboard/Team';
import Projects from './components/dashboard/Projects';
import Reports from './components/dashboard/Reports';

// Employee Dashboard Components
import MyTasks from './components/dashboard/MyTasks';
import MyProjects from './components/dashboard/MyProjects';
import DailyUpdates from './components/dashboard/DailyUpdates';
import Attendance from './components/dashboard/Attendance';
import Leave from './components/dashboard/Leave';

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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
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
              path="/project/:projectId"
              element={
                <PrivateRoute>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />

            <Route path="/project-details" element={<ProjectDetails />} />
           

            {/* Employee Dashboard Routes */}
            <Route
              path="/my-tasks"
              element={
                <PrivateRoute>
                  <MyTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-projects"
              element={
                <PrivateRoute>
                  <MyProjects />
                </PrivateRoute>
              }
            />
            <Route
              path="/daily-updates"
              element={
                <PrivateRoute>
                  <DailyUpdates />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path='/Leave'
              element={
                <PrivateRoute>
                  <Leave/>
                </PrivateRoute>
              }
      />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
