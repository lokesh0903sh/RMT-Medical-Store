import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';

const TopCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories?withProductCount=true&sort=name');
      setCategories(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  // Get only top 5 categories
  const topCategories = categories.slice(0, 5);

  // Category icons mapping for better visual appeal
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('allopathic') || name.includes('medicine')) {
      return '💊';
    } else if (name.includes('ayurvedic') || name.includes('herbal')) {
      return '🌿';
    } else if (name.includes('vitamin') || name.includes('supplement')) {
      return '🍃';
    } else if (name.includes('beauty') || name.includes('cosmetic')) {
      return '💄';
    } else if (name.includes('homeopathic')) {
      return '🔬';
    } else if (name.includes('nutritional') || name.includes('energy')) {
      return '⚡';
    } else if (name.includes('baby') || name.includes('child')) {
      return '👶';
    } else if (name.includes('diabetic') || name.includes('sugar')) {
      return '🩺';
    } else if (name.includes('surgical') || name.includes('device')) {
      return '🏥';
    } else {
      return '💊';
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-br from-white to-[#e0f7fa] dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036372]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-white to-[#e0f7fa] dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4">
            Top Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Explore our most popular medical categories for all your healthcare needs
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {topCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 h-full"
              >
                <div className="text-center h-full flex flex-col justify-between">
                  {/* Category Icon/Image */}
                  <div className="mb-3 sm:mb-4">
                    {category.imageUrl ? (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-[#036372] to-[#1fa9be] p-1">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-[#036372] to-[#1fa9be] rounded-full flex items-center justify-center text-white text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                        {getCategoryIcon(category.name)}
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#036372] dark:group-hover:text-[#1fa9be] transition-colors line-clamp-2 mb-1">
                      {category.name}
                    </h3>
                    {category.productCount && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.productCount} items
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/categories"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#036372] to-[#1fa9be] hover:from-[#1fa9be] hover:to-[#036372] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">Browse All Categories</span>
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Can't find what you're looking for? 
            <Link 
              to="/contact" 
              className="text-[#036372] dark:text-[#1fa9be] hover:underline font-medium ml-1"
            >
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TopCategories;
