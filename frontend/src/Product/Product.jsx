import React, { useState, useEffect } from 'react';
import Card from '../Card/Card';
import { motion } from '../lib/motion';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const Product = ({ featured = false, limit = 10 }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use fetch with API_BASE_URL instead of api client
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log('Categories API Response:', data);
        
        // Check if the response contains categories array or if it's directly an array
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          // Fallback to empty array if no valid categories data
          console.error('No valid categories data in API response', data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (featured) params.append('featured', 'true');
        if (limit) params.append('limit', limit);
        if (filter !== 'all') params.append('category', filter);
        if (searchQuery) params.append('search', searchQuery);
        
        // Handle sorting
        switch (sort) {
          case 'price-low':
            params.append('sort', 'price');
            break;
          case 'price-high':
            params.append('sort', '-price');
            break;
          case 'newest':
            params.append('sort', '-createdAt');
            break;
          case 'popular':
            params.append('sort', '-rating');
            break;
          default:
            params.append('sort', '-createdAt');
        }
        
        // Use fetch with API_BASE_URL instead of api client
        const response = await fetch(`${API_BASE_URL}/api/products?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Check if the response contains products array or if it's directly an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          // Fallback to empty array if no valid products data
          console.error('No valid products data in API response', data);
          setProducts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
        toast.error(err.message || 'Error fetching products. Please try again.');
      }
    };
    
    fetchProducts();
  }, [featured, limit, filter, sort, searchQuery]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already triggered by the useEffect dependency on searchQuery
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto"
    >
      {!featured && (
        <div className="mb-8">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-4 py-3 pl-10 pr-12 rounded-lg border-2 border-[#e0f7fa] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#1fa9be]"
                placeholder="Search for medicines, supplements, healthcare products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button 
                type="submit" 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          
          {/* Filter options */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                key="all"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  filter === 'all'
                    ? 'bg-[#036372] dark:bg-[#1fa9be] text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('all')}
              >
                All Products
              </button>
                {categories && categories.length > 0 && categories.map((category) => (
                <button
                  key={category?._id || `category-${Math.random()}`}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    filter === category?._id
                      ? 'bg-[#036372] dark:bg-[#1fa9be] text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                  }`}
                  onClick={() => category?._id && setFilter(category._id)}
                >
                  {category?.name || 'Unknown Category'}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by:
              </label>
              <select 
                id="sort" 
                className="bg-gray-100 dark:bg-gray-700 border-none text-sm rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] p-2"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No products found. Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >          {products && products.length > 0 && products.map((product) => (
            <motion.div 
              key={product?._id || `product-${Math.random()}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                id={product?._id}
                productName={product?.name}
                description={product?.description}
                price={product?.price}
                mrp={product?.mrp}
                imageUrl={product?.imageUrl}
                rating={product?.rating || 4}
                stock={product?.stock}
                discount={product?.discount}
                product={product}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Product;
