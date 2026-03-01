import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './componenets/auth/SignupPage';
import LoginPage from './componenets/auth/LoginPage';
import Dashboard from './componenets/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
                 <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/signup" replace />} />
             <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;