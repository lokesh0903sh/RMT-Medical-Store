import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import Pill1 from "../assets/capsule1.png.png";
import Pill2 from "../assets/capsule2.png.png";
import Pill3 from "../assets/capsule3.png.png";
import Pill4 from "../assets/capsule4.png.png";

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { reloadCart } = useCart();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/api/auth/signup', form);
      
      // Save token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Reload cart for the new user
      reloadCart();
      
      toast.success('Account created successfully! Welcome to RMT Medical Store!')
      
      // Redirect based on user role
      if (response.data.user && response.data.user.role === 'admin') {
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(err.response?.data?.message || 'Signup failed')
    }
    setLoading(false)
  }
  
  return (
    <section className="relative bg-gradient-to-br from-[#e0f7fa] to-white overflow-hidden min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      
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

      {/* Signup Form - Higher z-index */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 mx-auto min-h-[100vh]">
        <a
          href="/"
          className="flex items-center mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-28 h-24 sm:w-35 sm:h-30 mr-2"
            src="./src/assets/RMT_Medical_Store.png"
            alt="logo"
          />
        </a>
        <div className="w-full bg-white rounded-xl shadow-lg shadow-[#036372]/20 hover:shadow-[#036372]/30 transition-all md:mt-0 sm:max-w-md xl:p-0 border border-[#e0f7fa]">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-center font-bold leading-tight tracking-tight text-[#036372]">
              Create Your Account
            </h1>
            <form className="space-y-3 sm:space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-2 sm:p-3 shadow-sm"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-2 sm:p-3 shadow-sm"
                  placeholder="rmtmedical2005@gmail.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-2 sm:p-3 shadow-sm"
                  required
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with numbers & letters</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-[#036372] focus:ring-1"
                    required
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="terms" className="text-gray-500 dark:text-gray-400">
                    I agree to the <a href="#" className="text-[#1fa9be] hover:text-[#036372] font-medium">Terms and Conditions</a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-[#036372] hover:bg-[#1fa9be] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 sm:py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
              >
                {loading ? 
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                  : "Create Account"
                }
              </button>
              
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#1fa9be] hover:text-[#036372] transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Signup
