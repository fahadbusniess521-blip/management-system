import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Investments from './pages/Investments';
import Expenses from './pages/Expenses';
import Users from './pages/Users';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route
                path="investments"
                element={
                  <PrivateRoute roles={['admin', 'manager']}>
                    <Investments />
                  </PrivateRoute>
                }
              />
              <Route
                path="expenses"
                element={
                  <PrivateRoute roles={['admin', 'manager']}>
                    <Expenses />
                  </PrivateRoute>
                }
              />
              <Route
                path="users"
                element={
                  <PrivateRoute roles={['admin', 'manager']}>
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route path="ai-assistant" element={<AIAssistant />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
