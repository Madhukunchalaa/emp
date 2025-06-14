import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Employee2';
import ManagerDashboard from './components/dashboard/Manager2';
import DesignerDashboard from './components/dashboard/DesignerDashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import ProjectDetails from './components/dashboard/ProjectDetails';

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <PrivateRoute>
                  <ManagerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/designer-dashboard"
              element={
                <PrivateRoute>
                  <DesignerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/project-details" element={<ProjectDetails />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
