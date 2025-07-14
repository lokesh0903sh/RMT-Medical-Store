import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from '../../lib/motion';
import NavBar from '../../navbar/NavBar';
import Footer from '../../Footer/Footer';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!order && id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `https://rmt-medical-store.vercel.app/api/orders/${id}`,
        { headers: { 'x-auth-token': token } }
      );
      
      setOrder(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to load order details');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : order ? (
            <>
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block p-4 rounded-full bg-green-100 dark:bg-green-900 mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                  Thank You For Your Order!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your order has been placed successfully and is being processed.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      Order #{order?.orderId || 'Unknown'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {order?.createdAt ? formatDate(order.createdAt) : 'Unknown date'}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                      ${order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                      order?.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      order?.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      order?.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Order Items
                  </h3>
                  <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {order?.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index} className="flex items-center p-4">
                            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={item.product?.imageUrl || './src/assets/lohasav.jpg'} 
                                alt={item.product?.name || 'Product'} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.product?.name || 'Product'}</h4>
                              <div className="flex justify-between mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ₹{item.price} × {item.quantity}
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No items found in this order
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                      Shipping Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {order?.shippingAddress?.name || 'Name not available'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order?.shippingAddress?.street || 'Address not available'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order?.shippingAddress?.city || 'City'}, {order?.shippingAddress?.state || 'State'} {order?.shippingAddress?.postalCode || 'Postal Code'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order?.shippingAddress?.country || 'Country'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Phone: {order?.shippingAddress?.phone || 'Phone not available'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                      Order Summary
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                           order?.paymentMethod === 'online' ? 'Online Payment' : 
                           order?.paymentMethod === 'wallet' ? 'Wallet' : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                        <span className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${order?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            order?.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {order?.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
                          </span>
                        </span>
                      </div>
                      <div className="border-t dark:border-gray-600 my-3 pt-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200">₹{order?.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200">Free</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t dark:border-gray-600">
                          <span className="text-gray-800 dark:text-gray-100">Total</span>
                          <span className="text-[#036372] dark:text-[#1fa9be]">₹{order?.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link 
                  to="/products"
                  className="px-6 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors mx-2"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/orders"
                  className="px-6 py-3 border-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa]/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors mx-2"
                >
                  View All Orders
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
              <button 
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
