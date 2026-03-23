import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (like for admin dashboard), check it
  if (requiredRole) {
    const userRole = user?.role?.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    if (userRole !== required) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // For routes without requiredRole (like PDF page), just allow access
  return <Outlet />;
};

export default ProtectedRoute;