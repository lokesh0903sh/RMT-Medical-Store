import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HoverRightDropDown = ({ value, categoryId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch subcategories when hovering
  useEffect(() => {
    if (isHovered && categoryId) {
      setLoading(true);
      const fetchSubcategories = async () => {
        try {
          // Fetch products of this category to get unique subcategories
          const response = await axios.get(`https://rmt-medical-store.vercel.app/api/products?category=${categoryId}`);
          
          let products = [];
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data && Array.isArray(response.data.products)) {
            products = response.data.products;
          }

          // Extract unique subcategories
          const uniqueSubcategories = [...new Set(
            products
              .map(product => product.subCategory)
              .filter(subcat => subcat && subcat.trim() !== '')
          )];

          // If no subcategories found, use default options
          if (uniqueSubcategories.length === 0) {
            setSubcategories(['Branded', 'Generic']);
          } else {
            setSubcategories(uniqueSubcategories);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          setSubcategories(['Branded', 'Generic']); // Fallback
          setLoading(false);
        }
      };
      
      fetchSubcategories();
    }
  }, [isHovered, categoryId]);

  return (
    <div
      className="relative inline-block text-left w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex justify-between items-center w-full rounded-md text-sm cursor-pointer">
        {value}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-chevron-right text-[#036372] dark:text-gray-400 hover:text-[#1fa9be] dark:hover:text-white"
        >
          <polyline points="6 4 10 8 6 12"></polyline>
        </svg>
      </div>

      <div
        className={`${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        } transition-all duration-300 absolute left-full top-0 ml-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20`}
      >
        <div className="py-1">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : subcategories.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No subcategories
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <Link
                key={subcategory}
                to={`/products?category=${value.toLowerCase()}&subcategory=${subcategory.toLowerCase()}`}
                className="block px-4 py-2 text-sm hover:text-[#1fa9be] dark:hover:text-white text-[#036372] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {subcategory}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HoverRightDropDown;
