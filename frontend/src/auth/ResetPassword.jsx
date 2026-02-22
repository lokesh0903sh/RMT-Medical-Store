import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Clock } from "lucide-react";
import api from '../lib/api';
import Pill1 from "../assets/capsule1.png.png";
import Pill2 from "../assets/capsule2.png.png";
import Pill3 from "../assets/capsule3.png.png";
import Pill4 from "../assets/capsule4.png.png";
import RMTLogo from "../assets/RMT_Medical_Store_Transparent.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [tokenValidation, setTokenValidation] = useState({
    isValidating: true,
    isValid: false,
    message: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenValidation({
        isValidating: false,
        isValid: false,
        message: 'Invalid reset link. Please request a new password reset.'
      });
      return;
    }

    try {
      setTokenValidation(prev => ({ ...prev, isValidating: true }));
      const response = await api.post('/api/auth/validate-reset-token', { token });
      setTokenValidation({
        isValidating: false,
        isValid: true,
        message: 'Token is valid. You can now reset your password.'
      });
    } catch (err) {
      console.error('Token validation error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid or expired token';
      setTokenValidation({
        isValidating: false,
        isValid: false,
        message: errorMessage
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        password: form.password
      });
      
      toast.success('Password reset successfully! You can now login with your new password.');
      setResetSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const renderContent = () => {
    if (tokenValidation.isValidating) {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-[#e0f7fa] rounded-full mb-4">
            <svg className="animate-spin w-6 h-6 text-[#036372]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#036372]">
            Validating Reset Link...
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Please wait while we verify your reset token.
          </p>
        </div>
      );
    }

    if (!tokenValidation.isValid) {
      const isExpired = tokenValidation.message.toLowerCase().includes('expired');
      const isInvalid = tokenValidation.message.toLowerCase().includes('invalid');
      
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            {isExpired ? (
              <Clock className="w-6 h-6 text-red-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-red-600">
            {isExpired ? 'Link Expired' : 'Invalid Link'}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {tokenValidation.message}
          </p>
          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="inline-block w-full text-white bg-[#036372] hover:bg-[#1fa9be] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 sm:py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      );
    }

    if (resetSuccess) {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-green-600">
            Password Reset Success!
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Your password has been updated successfully. Redirecting to login...
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-[#e0f7fa] rounded-full mb-4">
            <Lock className="w-6 h-6 text-[#036372]" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#036372]">
            Reset Your Password
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-2 sm:p-3 pr-10 shadow-sm"
                required
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with numbers & letters</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="••••••••"
                className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-2 sm:p-3 pr-10 shadow-sm"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-[#036372] hover:bg-[#1fa9be] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 sm:py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </>
    );
  };

  return (
    <section className="relative bg-gradient-to-br from-[#e0f7fa] to-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Background Pills Layer - Fixed positioning with proper z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={Pill1}
          alt="Pill 1"
          className="absolute w-[100px] h-[100px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] top-10 left-5 md:top-16 md:left-10 lg:top-20 lg:left-20 animate-bounce opacity-30 md:opacity-40 lg:opacity-50 hover:opacity-60 transition-opacity hidden sm:block"
        />
        <img
          src={Pill2}
          alt="Pill 2"
          className="absolute w-[110px] h-[110px] md:w-[170px] md:h-[170px] lg:w-[200px] lg:h-[200px] top-10 right-5 md:top-16 md:right-10 lg:top-20 lg:right-20 animate-bounce opacity-30 md:opacity-40 lg:opacity-50 hover:opacity-60 transition-opacity hidden sm:block"
          style={{ animationDelay: "0.5s" }}
        />
        <img
          src={Pill3}
          alt="Pill 3"
          className="absolute w-[90px] h-[90px] md:w-[130px] md:h-[130px] lg:w-[150px] lg:h-[150px] bottom-5 left-5 md:bottom-10 md:left-10 lg:bottom-16 lg:left-20 animate-bounce opacity-30 md:opacity-40 lg:opacity-50 hover:opacity-60 transition-opacity hidden sm:block"
          style={{ animationDelay: "1s" }}
        />
        <img
          src={Pill4}
          alt="Pill 4"
          className="absolute w-[95px] h-[95px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] bottom-5 right-5 md:bottom-10 md:right-10 lg:bottom-16 lg:right-20 animate-bounce opacity-30 md:opacity-40 lg:opacity-50 hover:opacity-60 transition-opacity hidden sm:block"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Reset Password Form - Higher z-index */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 mx-auto min-h-screen">
        <a
          href="/"
          className="flex items-center mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-28 h-24 sm:w-35 sm:h-30 mr-2"
            src={RMTLogo}
            alt="RMT Medical Store Logo"
          />
        </a>
        
        <div className="w-full bg-white rounded-xl shadow-lg shadow-[#036372]/20 hover:shadow-[#036372]/30 transition-all md:mt-0 sm:max-w-md xl:p-0 border border-[#e0f7fa]">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {renderContent()}
            
            {!tokenValidation.isValidating && (
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1fa9be] hover:text-[#036372] transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;