import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HoverRightDropDown from './HoverRightDropDown';
import api from '../lib/api';

const DropDown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const data = response.data;
        
        console.log('Categories for dropdown:', data);
        
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error('No valid categories data in API response', data);
          setCategories([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Create grid layout: 10 categories per column, max 6 columns
  const getGridLayout = () => {
    const categoriesPerColumn = 10;
    const maxColumns = 6;
    const totalCategories = categories.length;
    
    if (totalCategories <= 60) {
      // Show all categories in grid
      const columns = Math.ceil(totalCategories / categoriesPerColumn);
      const grid = [];
      
      for (let col = 0; col < columns; col++) {
        const startIndex = col * categoriesPerColumn;
        const endIndex = Math.min(startIndex + categoriesPerColumn, totalCategories);
        grid.push(categories.slice(startIndex, endIndex));
      }
      
      return { grid, hasMore: false };
    } else {
      // Show first 60 categories with "Show More" option
      const displayCategories = showAllCategories ? categories : categories.slice(0, 60);
      const columns = Math.ceil(displayCategories.length / categoriesPerColumn);
      const grid = [];
      
      for (let col = 0; col < Math.min(columns, maxColumns); col++) {
        const startIndex = col * categoriesPerColumn;
        const endIndex = Math.min(startIndex + categoriesPerColumn, displayCategories.length);
        grid.push(displayCategories.slice(startIndex, endIndex));
      }
      
      return { grid, hasMore: !showAllCategories && totalCategories > 60 };
    }
  };

  const { grid, hasMore } = getGridLayout();

  return (
    <div className="relative inline-block text-left group">
      <button className="rounded-md px-3 py-2 text-sm font-bold text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white inline-flex items-center justify-center transition-colors">
        Medicine 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down mt-1 ml-1">
          <polyline points="4 6 8 10 12 6"></polyline>
        </svg>
      </button>

      {/* Large Grid Dropdown */}
      <div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute z-50 mt-2 left-0 transform -translate-x-1/4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-6xl">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-pulse flex justify-center items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</div>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">No categories available</div>
            </div>
          ) : (
            <div className="p-4">
              {/* Header */}
              <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-[#036372] dark:text-[#1fa9be]">
                  Medicine Categories
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {categories.length} categories available
                </p>
              </div>

              {/* Grid Layout */}
              <div className="flex gap-6">
                {grid.map((column, colIndex) => (
                  <div key={colIndex} className="flex-1 min-w-0">
                    <div className="space-y-1">
                      {column.map((category, index) => (
                        <Link
                          key={category._id || category.id || index}
                          to={`/products?category=${encodeURIComponent(category.name)}`}
                          className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:text-[#036372] dark:hover:text-[#1fa9be] rounded-md transition-colors duration-200 truncate"
                          title={category.name}
                        >
                          {category.name}
                          {category.productCount && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({category.productCount})
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {hasMore && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="inline-flex items-center px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Show More Categories ({categories.length - 60} more)
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* View All Link */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  View All Products
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropDown