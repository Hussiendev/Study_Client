import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SignupPage from './components/auth/SignupPage'
import LoginPage from './components/auth/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import PdfSummaryPage from './components/pdf/PdfSummaryPage'; // NEW: Import PDF component
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <Routes>
            {/* Public Routes - Always accessible */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes - Require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pdf" element={<PdfSummaryPage />} /> {/* NEW: PDF route */}
              <Route path="/flashcards" element={<PdfSummaryPage />} /> {/* NEW: Flashcards route (same page) */}
              {/* Add other protected routes here */}
            </Route>  
            
            {/* Redirect root to pdf page */}
            <Route path="/" element={<Navigate to="/pdf" replace />} />
            
            {/* Redirect any unknown routes to pdf */}
            <Route path="*" element={<Navigate to="/pdf" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;