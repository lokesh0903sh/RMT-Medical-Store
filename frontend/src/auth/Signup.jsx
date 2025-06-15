import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Signup failed')
      } else {
        toast.success('Signup successful! Redirecting to login...')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err) {
      toast.error('Server error')
    }
    setLoading(false)
  }
  
  return (    <section className="relative bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Animated Pills - Similar to Login page*/}
      <img
        src="../assets/capsule1.png.png"
        alt="Pill 1"
        className="absolute w-[180px] h-[180px] top-20 left-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
      />
      <img
        src="../assets/capsule2.png.png"
        alt="Pill 2"
        className="absolute w-[200px] h-[200px] top-20 right-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "0.5s" }}
      />
      <img
        src="../assets/capsule3.png.png"
        alt="Pill 3"
        className="absolute w-[150px] h-[150px] bottom-10 left-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "1s" }}
      />
      <img
        src="../assets/capsule4.png.png"
        alt="Pill 4"
        className="absolute w-[160px] h-[160px] bottom-20 right-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "1.5s" }}
      />
      
      <div className="flex flex-col items-center justify-center py-6 mx-auto">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="h-[60px] w-auto mr-2"
            src="./src/assets/RMT_Medical_Store.png"
            alt="logo"
          />
        </a>
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-[#036372]/20 hover:shadow-[#036372]/30 dark:shadow-[#1fa9be]/20 dark:hover:shadow-[#1fa9be]/30 transition-all md:mt-0 sm:max-w-md p-0 border border-[#e0f7fa] dark:border-gray-700">
          <div className="p-8 space-y-6">
            <h1 className="text-2xl text-center font-bold leading-tight tracking-tight text-[#036372] md:text-3xl dark:text-[#1fa9be]">
              Create an Account
            </h1>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 dark:bg-gray-700 border border-[#1fa9be] dark:border-[#1fa9be] text-gray-800 dark:text-white rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-[#036372] dark:focus:border-[#1fa9be] block w-full p-3 shadow-sm"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 dark:bg-gray-700 border border-[#1fa9be] dark:border-[#1fa9be] text-gray-800 dark:text-white rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-[#036372] dark:focus:border-[#1fa9be] block w-full p-3 shadow-sm"
                  placeholder="rmtmedical2005@gmail.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 dark:bg-gray-700 border border-[#1fa9be] dark:border-[#1fa9be] text-gray-800 dark:text-white rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-[#036372] dark:focus:border-[#1fa9be] block w-full p-3 pr-10 shadow-sm"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with numbers & letters</p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#036372] dark:text-[#1fa9be] focus:ring-[#036372] dark:focus:ring-[#1fa9be]"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  I agree to the <a href="#" className="text-[#1fa9be] hover:text-[#036372] dark:hover:text-white">Terms and Conditions</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-5 py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
              
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  {success}
                </div>
              )}
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#1fa9be] hover:text-[#036372] dark:hover:text-white transition-colors"
                >
                  Log in instead
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