import React,  { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import api from "../lib/api";
import Pill1 from "../assets/capsule1.png.png";
import Pill2 from "../assets/capsule2.png.png";
import Pill3 from "../assets/capsule3.png.png";
import Pill4 from "../assets/capsule4.png.png";

const Login = () => {

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use api utility for backend connectivity
      const response = await api.post('/api/auth/login', form);
      const data = response.data;
      
      // Save token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      
      // Redirect based on user role
      if (data.user && data.user.role === 'admin') {
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || "Login failed");
      toast.error("Server error");
    }
    setLoading(false);
  };
  return (
    <section className="relative bg-gradient-to-br from-[#e0f7fa] to-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Animated Pills - responsive positioning */}
      <img
        src={Pill1}
        alt="Pill 1"
        className="absolute w-[100px] h-[100px] md:w-[180px] md:h-[180px] top-10 left-5 md:top-20 md:left-30 animate-bounce opacity-40 md:opacity-60 hover:opacity-80 transition-opacity hidden sm:block"
      />
      <img
        src={Pill2}
        alt="Pill 2"
        className="absolute w-[110px] h-[110px] md:w-[200px] md:h-[200px] top-10 right-5 md:top-20 md:right-30 animate-bounce opacity-40 md:opacity-60 hover:opacity-80 transition-opacity hidden sm:block"
        style={{ animationDelay: "0.5s" }}
      />
      <img
        src={Pill3}
        alt="Pill 3"
        className="absolute w-[90px] h-[90px] md:w-[150px] md:h-[150px] bottom-5 left-5 md:bottom-10 md:left-30 animate-bounce opacity-40 md:opacity-60 hover:opacity-80 transition-opacity hidden sm:block"
        style={{ animationDelay: "1s" }}
      />
      <img
        src={Pill4}
        alt="Pill 4"
        className="absolute w-[95px] h-[95px] md:w-[160px] md:h-[160px] bottom-5 right-5 md:bottom-20 md:right-30 animate-bounce opacity-40 md:opacity-60 hover:opacity-80 transition-opacity hidden sm:block"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Login Form */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 mx-auto min-h-[100vh]">
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
              Welcome Back
            </h1>
            <form className="space-y-3 sm:space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 sm:mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
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
                  autoComplete="current-password"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-[#036372] focus:ring-1"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-400">Remember me</label>
                  </div>
                </div>
                <a href="#" className="text-sm font-medium text-[#1fa9be] hover:text-[#036372]">Forgot password?</a>
              </div>
              
              <button
                type="submit"
                className="w-full text-white bg-[#036372] hover:bg-[#1fa9be] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 sm:py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? 
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                  : "Sign in"
                }
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}                <Link
                  to="/signup"
                  className="font-semibold text-[#1fa9be] hover:text-[#036372] transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
