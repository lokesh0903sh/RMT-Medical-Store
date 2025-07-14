import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from '../lib/motion';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';
import Cart from '../components/Cart/Cart';
import Card from '../Card/Card';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(12);

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      // Find category by name (case insensitive)
      const foundCategory = categories.find(cat => 
        cat.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (foundCategory) {
        setFilter(foundCategory._id);
      } else {
        // If category not found by name, try to use it as direct filter
        setFilter(categoryParam);
      }
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, categories]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://rmt-medical-store.vercel.app//api/categories');
        console.log('Categories API Response:', response.data);
        
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          console.error('No valid categories data in API response', response.data);
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
        
        const params = new URLSearchParams();
        
        if (filter !== 'all') params.append('category', filter);
        if (searchQuery) params.append('search', searchQuery);
        params.append('page', currentPage);
        params.append('limit', productsPerPage);
        
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
          case 'name':
            params.append('sort', 'name');
            break;
          default:
            params.append('sort', '-createdAt');
        }
        
        const response = await axios.get(`https://rmt-medical-store.vercel.app//api/products?${params}`);
        console.log('API Response:', response.data);
        
        if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalPages(1);
        } else if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination?.pages || 1);
        } else {
          console.error('No valid products data in API response', response.data);
          setProducts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
        toast.error('Error fetching products. Please try again.');
      }
    };
    
    fetchProducts();
  }, [filter, sort, searchQuery, currentPage, productsPerPage]);

  // Show scroll to top button
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const clearFilters = () => {
    setFilter('all');
    setSort('newest');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300'>
      <NavBar />
      
      <motion.main 
        className='flex-grow container mx-auto px-4 py-8'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4">
            Our Products
          </h1>
          <motion.div 
            className="h-1.5 w-24 bg-[#1fa9be] dark:bg-[#036372] mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our comprehensive range of authentic medicines, health supplements, and medical supplies
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-6 py-4 pl-12 pr-32 rounded-xl border-2 border-[#e0f7fa] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#1fa9be] transition-colors text-lg"
                placeholder="Search for medicines, supplements, healthcare products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
          
          {/* Filter options */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                key="all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  filter === 'all'
                    ? 'bg-[#036372] dark:bg-[#1fa9be] text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('all')}
              >
                All Products
              </motion.button>
              
              {categories && categories.length > 0 && categories.map((category) => (
                <motion.button
                  key={category._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    filter === category._id
                      ? 'bg-[#036372] dark:bg-[#1fa9be] text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFilter(category._id)}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
            
            {/* Sort and clear filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort by:
                </label>
                <select 
                  id="sort" 
                  className="bg-gray-100 dark:bg-gray-700 border-none text-sm rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] p-2 min-w-[140px]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Showing ${products.length} products`}
            {searchQuery && ` for "${searchQuery}"`}
            {filter !== 'all' && categories.find(cat => cat._id === filter) && 
              ` in ${categories.find(cat => cat._id === filter).name}`
            }
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div 
              className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#036372] dark:border-[#1fa9be]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          </div>
        ) : error ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
              <button 
                className="px-6 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors font-medium"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">No products found</p>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Try adjusting your filters or search query</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              {products && products.length > 0 && products.map((product, index) => (
                <motion.div 
                  key={product?._id || `product-${index}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex justify-center items-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-700 shadow-md'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#036372] dark:bg-[#1fa9be] text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-700 shadow-md'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-700 shadow-md'
                  }`}
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.main>
      
      <Footer />
      <Cart />
      
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-[#036372] dark:bg-[#1fa9be] text-white p-3 rounded-full shadow-lg hover:bg-[#1fa9be] dark:hover:bg-[#036372] transition-colors z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
