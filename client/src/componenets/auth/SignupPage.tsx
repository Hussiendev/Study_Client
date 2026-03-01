import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import PasswordMeter from "../ui/PasswordMeter";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    // For now, just log the data
    console.log("Signup data:", { name, email, password });
    alert("Signup successful! (check console)");
    
    // Clear form
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-blue-50 bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden'
    >
      <div className='p-8'>
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-900 to-blue-500 text-transparent bg-clip-text'>
          Create an Account
        </h2>

        <form onSubmit={handleSignup}>
          <Input
            icon={User}
            type='text'
            placeholder='Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
          
          <PasswordMeter password={password} />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full py-3 px-4 bg-gradient-to-r from-blue-900 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 transition duration-200'
            type='submit'
          >
            Sign Up
          </motion.button>
        </form>
      </div>
      
      <div className='px-8 py-4 bg-blue-900 bg-opacity-90 flex justify-center'>
        <p className='text-sm text-blue-50'>
          Already have an account?{" "}
          <Link to='/login' className='text-blue-300 hover:underline'>
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupPage;