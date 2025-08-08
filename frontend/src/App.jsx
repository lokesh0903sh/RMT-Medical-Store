import { useState, useEffect } from 'react';
import './App.css';
import Home from './Home/Home';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import MedicalQueryForm from './QueryForm/MedicalQueryForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProductDetail from './Product/ProductDetail';
import Products from './Product/Products';
import Checkout from './components/Checkout/Checkout';
import Orders from './components/Orders/Orders';
import OrderConfirmation from './components/Orders/OrderConfirmation';
import AboutUs from './AboutUs/AboutUs';
import Contact from './Contact/Contact';
import Help from './Help/Help';

// Admin Components
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/components/AdminDashboard';

// Product Management
import ProductList from './admin/products/ProductList';
import ProductForm from './admin/products/ProductForm';

// Category Management
import CategoryList from './admin/categories/CategoryList';
import CategoryForm from './admin/categories/CategoryForm';

// Notification Management
import NotificationList from './admin/notifications/NotificationList';
import NotificationForm from './admin/notifications/NotificationForm';

// Order Management
import OrderList from './admin/orders/OrderList';

// User Management
import UserManagement from './admin/users/UserManagement';

// Settings Management
import AdminSettings from './admin/settings/AdminSettings';

// Query Management
import QueryManagement from './admin/queries/QueryManagement';

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
      element: <Layout />,
      children: [
        { index: true, element: <Home/> },
        { path: 'products', element: <Products/> },
        { path: 'about', element: <AboutUs/> },
        { path: 'contact', element: <Contact/> },
        { path: 'help', element: <Help/> },
        { path: 'login', element: <Login/> },
        { path: 'signup', element: <Signup/> },
        { path: 'products/:id', element: <ProductDetail /> },
        { path: 'checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
        { path: 'orders', element: <ProtectedRoute><Orders /></ProtectedRoute> },
        { path: 'orders/:id', element: <ProtectedRoute><OrderConfirmation /></ProtectedRoute> },
        { path: 'medical-query', element: <ProtectedRoute><MedicalQueryForm/></ProtectedRoute> },
        { path: 'query-form', element: <ProtectedRoute><MedicalQueryForm/></ProtectedRoute> },
        
        // Admin Routes
        {
          path: 'admin',
          element: <ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>,
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'products', element: <ProductList /> },
            { path: 'products/new', element: <ProductForm /> },
            { path: 'products/edit/:id', element: <ProductForm /> },
            { path: 'categories', element: <CategoryList /> },
            { path: 'categories/new', element: <CategoryForm /> },
            { path: 'categories/edit/:id', element: <CategoryForm /> },
            { path: 'notifications', element: <NotificationList /> },
            { path: 'notifications/new', element: <NotificationForm /> },
            { path: 'notifications/edit/:id', element: <NotificationForm /> },
            { path: 'orders', element: <OrderList /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'settings', element: <AdminSettings /> },
            { path: 'queries', element: <QueryManagement /> }
          ]
        }
      ]
    }
  ]);

  return (
    <>
      <CartProvider>
        <div>
          <RouterProvider router={appRouter} />
        </div>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={document.documentElement.classList.contains('dark') ? "dark" : "light"}
        />
      </CartProvider>
    </>
  )
}

export default App
