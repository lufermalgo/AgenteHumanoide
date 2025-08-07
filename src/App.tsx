import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import LoginPage from './components/Auth/LoginPage';
import AssessmentPage from './components/QuestionFlow/AssessmentPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
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
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;