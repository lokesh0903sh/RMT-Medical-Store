import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const ReviewableProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewableProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders/reviewable-products');
        setProducts(response.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviewable products:', err);
        setError('Failed to load products available for review');
        setLoading(false);
        toast.error('Error loading products. Please try again.');
      }
    };

    fetchReviewableProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="mb-6">
          <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Products To Review</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have any delivered products that need reviews yet.
        </p>
        <Link
          to="/products"
          className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Products Available for Review
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
          <motion.div
            key={`${item.orderId}-${item.productId}`}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-[#e0f7fa]/20 dark:bg-gray-700/20 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.productImage || "./src/assets/lohasav.jpg"}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                    {item.productName}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Delivered on {new Date(item.deliveryDate).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/products/${item.productId}?review=true&orderId=${item.orderId}`}
                    className="inline-block text-sm px-3 py-1.5 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
                  >
                    Write Review
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewableProducts;
