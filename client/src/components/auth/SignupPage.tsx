import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import PasswordMeter from "../ui/PasswordMeter";
import { useAuth } from "../../contexts/AuthContext";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
      setLocalError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    // Email validation matching your backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Invalid email format");
      return;
    }

    try {
      setLocalError("");
      await register(email, name, password);
      
      // After successful signup, navigate to login
      // (Your backend doesn't auto-login after signup)
      navigate("/login", { 
        state: { message: "Account created successfully! Please login." } 
      });
      
    } catch (err) {
      // Error is handled in context
      console.log("Signup error:", err);
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
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text'>
          Create an Account
        </h2>

        <form onSubmit={handleSignup}>
          <Input
            icon={User}
            type='text'
            placeholder='Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

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

          <Input
            icon={Lock}
            type='password'
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          {/* Password Strength Meter */}
          <PasswordMeter password={password} />

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
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </motion.button>
        </form>
      </div>
      
      <div className='px-8 py-4 bg-blue-600 flex justify-center'>
        <p className='text-sm text-white'>
          Already have an account?{" "}
          <Link to='/login' className='text-cyan-200 hover:text-white hover:underline font-medium'>
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupPage; 