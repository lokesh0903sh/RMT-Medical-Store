import { useState, useEffect } from 'react'
import './App.css'
import Home from './Home/Home'
import Login from './auth/Login';
import Signup from './auth/Signup';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import MedicalQueryForm from './QueryForm/MedicalQueryForm';

function App() {
  // Initialize dark mode from localStorage
  useEffect(() => {
    // Check user preference from localStorage
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    
    // Apply dark mode class if it was enabled
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: <Home/>
    },
    {
      path: '/login',
      element: <Login/>
    },
    {
      path: '/signup',
      element: <Signup/>
    },
    {
      path: '/medical-query',
      element: <MedicalQueryForm/>
    },
    {
      path: '/query-form',
      element: <MedicalQueryForm/>
    }
  ]);

  return (
    <>
    <div>
      <RouterProvider router={appRouter} />
    </div>
    </>
  )
}

export default App
