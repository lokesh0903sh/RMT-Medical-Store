import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HoverRightDropDown from './HoverRightDropDown';
import api from '../lib/api';

const DropDown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative inline-block text-left group">
      <button className="rounded-md px-3 py-2 text-sm font-bold text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white inline-flex items-center justify-center transition-colors">
        Medicine 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down mt-1 ml-1">
          <polyline points="4 6 8 10 12 6"></polyline>
        </svg>
      </button>

      <div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute z-10 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
        <div className="py-1">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No categories available
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="block px-4 py-2 text-sm text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {category.name === 'Allopathic' ? (
                  <HoverRightDropDown value={category.name} categoryId={category._id} />
                ) : (
                  category.name
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DropDown