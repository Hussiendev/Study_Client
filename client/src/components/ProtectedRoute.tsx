import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string; // Make role optional
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 'admin' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (case-insensitive)
  const userRole = user?.role?.toLowerCase();
  const required = requiredRole.toLowerCase();
  
  if (userRole !== required) {
    // User is authenticated but not admin - redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated AND is admin
  return <Outlet />;
};

export default ProtectedRoute;