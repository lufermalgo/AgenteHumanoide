import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './components/Auth/AuthProvider';
import LoginPage from './components/Auth/LoginPage';
import AssessmentPage from './components/QuestionFlow/AssessmentPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/assessment" 
              element={
                <ProtectedRoute>
                  <AssessmentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AssessmentPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;