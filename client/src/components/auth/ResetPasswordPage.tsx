import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../ui/Input";
import PasswordMeter from "../ui/PasswordMeter";
import api from "../../service/api";

const ResetPasswordPage: React.FC = () => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!code || !newPassword || !confirmPassword) {
    setError("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (newPassword.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  try {
    setLoading(true);
    setError("");
    
    // ✅ Use the correct endpoint - update-pass, not reset-password
    const response = await api.put('/auth/update-pass', 
      {
        email,
        token: code,  // Your backend expects 'token' parameter
        pass: newPassword  // Your backend expects 'pass' parameter
      }
      // NO AUTH HEADERS NEEDED
    );

    console.log('Reset password response:', response.data);
    setSuccess(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login', { 
        state: { message: "Password reset successful! Please login with your new password." } 
      });
    }, 3000);
    
  } catch (err: any) {
    console.error('Reset password error:', err.response?.data);
    
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        'Failed to reset password. Please try again.';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  if (!email) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8'
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">No email provided. Please start from forgot password.</p>
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Go to Forgot Password
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden'
    >
      <div className='p-8'>
        <div className="flex items-center mb-6">
          <Link to="/forgot-password" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text'>
            Reset Password
          </h2>
        </div>

        {!success ? (
          <>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit code sent to:<br />
              <strong className="text-blue-600">{email}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              <Input
                icon={Lock}
                type='password'
                placeholder='New Password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />

              <Input
                icon={Lock}
                type='password'
                placeholder='Confirm New Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <PasswordMeter password={newPassword} />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-red-500 font-semibold mb-4 text-sm'
                >
                  {error}
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
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;