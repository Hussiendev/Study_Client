import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../ui/Input";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    // For now, just log the data
    console.log("Login data:", { email, password });
    alert("Login successful! (check console)");
    
    // Navigate to dashboard or home (you can change this later)
    // navigate("/dashboard");
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
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type='email'
            placeholder='Email Address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot password link */}
          <div className='text-right mb-4'>
            <Link to='/forgot-password' className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
              Forgot Password?
            </Link>
          </div>

          {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition duration-200'
            type='submit'
          >
            Login
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