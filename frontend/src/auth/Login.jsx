import React,  { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Login failed");
      } else {
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
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Server error");
    }
    setLoading(false);
  };
  return (
    <section className="relative bg-gradient-to-br from-[#e0f7fa] to-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Animated Pills */}
      <img
        src={Pill1}
        alt="Pill 1"
        className="absolute w-[180px] h-[180px] top-20 left-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
      />
      <img
        src={Pill2}
        alt="Pill 2"
        className="absolute w-[200px] h-[200px] top-20 right-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "0.5s" }}
      />
      <img
        src={Pill3}
        alt="Pill 3"
        className="absolute w-[150px] h-[150px] bottom-10 left-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "1s" }}
      />
      <img
        src={Pill4}
        alt="Pill 4"
        className="absolute w-[160px] h-[160px] bottom-20 right-30 animate-bounce opacity-60 hover:opacity-80 transition-opacity"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Login Form */}
      <div className="flex flex-col items-center justify-center px-6 py-6 mx-auto">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-35 h-30 mr-2"
            src="./src/assets/RMT_Medical_Store.png"
            alt="logo"
          />
        </a>        <div className="w-full bg-white rounded-xl shadow-lg shadow-[#036372]/20 hover:shadow-[#036372]/30 transition-all md:mt-0 sm:max-w-md xl:p-0 border border-[#e0f7fa]">
          <div className="p-8 space-y-6">
            <h1 className="text-2xl text-center font-bold leading-tight tracking-tight text-[#036372] md:text-3xl">
              Welcome Back
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-3 shadow-sm"
                  placeholder="rmtmedical2005@gmail.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Abc@1234"
                  className="bg-gray-50 border border-[#1fa9be] text-gray-800 rounded-lg focus:ring-[#036372] focus:border-[#036372] block w-full p-3 shadow-sm"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>              <button
                type="submit"
                className="w-full text-white bg-[#036372] hover:bg-[#1fa9be] focus:ring-4 focus:outline-none focus:ring-[#036372]/30 font-medium rounded-lg text-sm px-5 py-3 text-center shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
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
