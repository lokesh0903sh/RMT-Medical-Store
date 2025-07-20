import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { useCart } from '../../context/CartContext';
import NavBar from '../../navbar/NavBar';
import Footer from '../../Footer/Footer';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cart has items
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Validate shipping fields
    const requiredFields = ['name', 'street', 'city', 'state', 'postalCode', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format order data
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod
      };
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to place an order');
        navigate('/login');
        return;
      }
      
      // Submit order
      const response = await api.post('/api/orders', orderData);
      
      // Clear cart on success
      clearCart();
      
      // Show success and navigate to order confirmation
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order._id}`, { 
        state: { orderDetails: response.data.order } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
            Checkout
          </h1>
          
          {items.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 dark:text-gray-600 mb-4">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
              <button 
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <motion.div 
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center py-2 border-b dark:border-gray-700"
                      >
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={item.imageUrl || './src/assets/lohasav.jpg'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                            {item.name}
                          </p>
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>₹{item.price} × {item.quantity}</span>
                            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t dark:border-gray-700">
                      <span className="text-gray-800 dark:text-gray-100">Total</span>
                      <span className="text-[#036372] dark:text-[#1fa9be]">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Checkout Form */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  {/* Shipping Information */}
                  <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                      Shipping Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={shippingAddress.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={shippingAddress.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          required
                          pattern="[0-9]{10}"
                          title="Please enter a 10-digit phone number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="h-4 w-4 text-[#036372] dark:text-[#1fa9be] focus:ring-[#036372] dark:focus:ring-[#1fa9be]"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center p-3 border dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="h-4 w-4 text-[#036372] dark:text-[#1fa9be] focus:ring-[#036372] dark:focus:ring-[#1fa9be]"
                          disabled
                        />
                        <span className="ml-2 text-gray-400 dark:text-gray-500">Online Payment (Coming Soon)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="p-6">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
