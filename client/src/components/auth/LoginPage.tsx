import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../ui/Input";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated, user, logout } = useAuth();

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Redirect based on role when authenticated - BUT ONLY AFTER LOGIN ATTEMPT
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user, isRedirecting });
    
    // Only redirect if we're on the login page and we've just successfully logged in
    // Not if we were already authenticated when loading the page
    if (isAuthenticated && user && isRedirecting) {
      console.log('User role:', user.role);
      
      // Check user role and redirect accordingly
      if (user.role === 'admin' || user.role === 'Admin' || user.role === 'ADMIN') {
        console.log('Admin user detected, redirecting to home');
        navigate('/');
      } else {
        console.log('Regular user detected, redirecting to home');
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, isRedirecting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setLocalError("All fields are required");
      return;
    }

    try {
      setLocalError("");
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login successful, setting redirect flag...');
      setIsRedirecting(true); // Set flag to true after successful login
    } catch (err) {
      console.error('Login error caught:', err);
    }
  };

  // If already authenticated when page loads, show option to logout
  if (isAuthenticated && user && !isRedirecting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden'
      >
        <div className='p-8'>
          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text'>
            Already Logged In
          </h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 mb-3">
              You're already logged in as <strong>{user?.name}</strong>
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Email: {user?.email}<br />
              Role: {user?.role}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
              
              <button
                onClick={() => {
                  logout();
                  setIsRedirecting(false);
                }}
                className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Normal login form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden'
    >
      <div className='p-8'>
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text'>
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type='email'
            placeholder='Email Address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            icon={Lock}
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {/* Forgot password link */}
          <div className='text-right mb-4'>
            <Link to='/forgot-password' className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
              Forgot Password?
            </Link>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-green-500 font-semibold mb-2 text-sm'
            >
              {successMessage}
            </motion.p>
          )}

          {/* Error Messages */}
          {(localError || error) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-red-500 font-semibold mb-2 text-sm'
            >
              {localError || error}
            </motion.p>
          )}
          
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-cyan-600'} 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition duration-200
              flex items-center justify-center gap-2`}
            type='submit'
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
      </div>
      
      <div className='px-8 py-4 bg-blue-600 flex justify-center'>
        <p className='text-sm text-white'>
          Don't have an account?{" "}
          <Link to='/signup' className='text-cyan-200 hover:text-white hover:underline font-medium'>
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;