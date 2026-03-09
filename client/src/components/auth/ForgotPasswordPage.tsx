import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import api from "../../service/api";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      setLoading(true);
      setError("");
      

      
      // Send request to your backend
      const response = await api.post('/auth/forgot-password', 
        { email },
       
      );

      console.log('Forgot password response:', response.data);
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Forgot password error:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden'
    >
      <div className='p-8'>
        <div className="flex items-center mb-6">
          <Link to="/login" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text'>
            Forgot Password
          </h2>
        </div>

        {!success ? (
          <>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                icon={Mail}
                type='email'
                placeholder='Email Address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

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
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
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
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h3>
            <p className="text-gray-600 mb-6">
              We've sent a password reset code to:<br />
              <strong className="text-blue-600">{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The code expires in 15 minutes.
            </p>
            <Link
              to="/reset-password"
              state={{ email }}
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 transition duration-200"
            >
              Enter Reset Code
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Didn't receive an email?{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-blue-600 hover:underline"
              >
                Try again
              </button>
            </p>
          </motion.div>
        )}
      </div>

      <div className='px-8 py-4 bg-gray-50 flex justify-center border-t border-gray-200'>
        <p className='text-sm text-gray-600'>
          Remember your password?{" "}
          <Link to='/login' className='text-blue-600 hover:underline font-medium'>
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;