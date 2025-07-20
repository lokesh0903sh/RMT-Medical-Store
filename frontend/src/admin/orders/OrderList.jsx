import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from '../../lib/motion';

const OrderList = () => {
  // Use VITE_API_BASE_URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const limit = 10; // orders per page
  
  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication error. Please login again.');
        setLoading(false);
        return;
      }
      
      // Build query parameters
      let query = `?page=${currentPage}&limit=${limit}`;
      if (filter !== 'all') {
        query += `&status=${filter}`;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/orders${query}`,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          } 
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    }
  };
  
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          } 
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setSelectedOrder(data.order);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(error.response?.data?.message || 'Failed to load order details');
    }
  };
  
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          },
          body: JSON.stringify({ status })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update order in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );
      
      // Update selected order if modal is open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge style
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="container px-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Order Management</h1>
      </div>
      
      {/* Filter Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              filter === status
                ? 'bg-[#036372] dark:bg-[#1fa9be] text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
          </div>
        ) : error ? (
          <div className="text-center p-12">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500 dark:text-gray-400">No orders found with the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <motion.tr 
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{order.user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">User info not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#036372] dark:text-[#1fa9be]">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => fetchOrderDetails(order._id)}
                        className="text-[#036372] dark:text-[#1fa9be] hover:underline mr-2"
                      >
                        View
                      </button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="inline-block ml-2">
                          <select
                            className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md mr-2 ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 mx-1 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-[#036372] dark:bg-[#1fa9be] text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ml-2 ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Order #{selectedOrder.orderId}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Order Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                           selectedOrder.paymentMethod === 'online' ? 'Online Payment' : 'Wallet'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    {selectedOrder.user ? (
                      <>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {selectedOrder.user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedOrder.user.email}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">User information not available</p>
                    )}
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress.street}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress.country}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Phone: {selectedOrder.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                  Order Items
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-transparent dark:divide-gray-700">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {item.product?.imageUrl && (
                                  <img 
                                    src={item.product.imageUrl || './src/assets/lohasav.jpg'} 
                                    alt={item.product.name} 
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {item.product?.name || 'Product Not Available'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subtotal:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                          ₹{selectedOrder.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                          Shipping:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                          Free
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-800 dark:text-gray-100">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#036372] dark:text-[#1fa9be]">
                          ₹{selectedOrder.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Update Status Section */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Update Order Status
                  </h4>
                  <div className="flex items-center">
                    <select
                      className="mr-4 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <motion.button
                      onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
                    >
                      Update Status
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
              <motion.button
                onClick={() => setIsModalOpen(false)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
