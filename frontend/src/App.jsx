import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FormEditorPage from './pages/FormEditorPage';
import FormViewPage from './pages/FormViewPage';
import ResponsesPage from './pages/ResponsesPage';
import DemoFormEditor from './components/DemoFormEditor';

const theme = createTheme({
  palette: {
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/demo" element={<DemoFormEditor />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/forms/new" element={
              <ProtectedRoute>
                <FormEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/forms/:id/edit" element={
              <ProtectedRoute>
                <FormEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/forms/:id" element={<FormViewPage />} />
            <Route path="/forms/:id/responses" element={
              <ProtectedRoute>
                <ResponsesPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
