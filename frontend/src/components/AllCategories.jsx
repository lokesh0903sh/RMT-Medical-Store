import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState('');
  
  // Alphabet navigation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.get('/api/categories?withProductCount=true'),
        api.get('/api/products')
      ]);
      
      setCategories(categoriesResponse.data || []);
      setProducts(productsResponse.data?.products || productsResponse.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  // Sort products alphabetically
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  // Filter categories by selected letter
  const filteredCategories = selectedLetter 
    ? sortedCategories.filter(cat => cat.name.toUpperCase().startsWith(selectedLetter))
    : sortedCategories;

  // Filter products by selected letter
  const filteredProducts = selectedLetter 
    ? sortedProducts.filter(prod => prod.name.toUpperCase().startsWith(selectedLetter))
    : sortedProducts;

  // Group categories by first letter
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const firstLetter = category.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(category);
    return acc;
  }, {});

  // Group products by first letter
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const firstLetter = product.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(product);
    return acc;
  }, {});

  // Products display limit
  const displayedProducts = showMoreProducts ? filteredProducts : filteredProducts.slice(0, 12);

  const scrollToLetter = (letter) => {
    setSelectedLetter(selectedLetter === letter ? '' : letter);
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <NavBar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#036372]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NavBar />
      
      {/* Hero Section for Categories */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[#036372] animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-[#1fa9be] animate-pulse delay-75"></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full bg-[#036372] animate-pulse delay-150"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 rounded-full bg-[#1fa9be] animate-pulse delay-300"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Main Title */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#036372] dark:text-[#1fa9be] mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              All Categories
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover our complete collection of medical products and categories, 
              <span className="text-[#036372] dark:text-[#1fa9be] font-semibold"> organized for your convenience</span>
            </motion.p>

            {/* Filter Pills */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={() => scrollToLetter('')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedLetter === '' 
                    ? 'bg-[#036372] text-white shadow-lg shadow-[#036372]/25' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:shadow-md'
                }`}
              >
                All Products
              </button>
              <button className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:shadow-md">
                Allopathic
              </button>
              <button className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:shadow-md">
                Ayurvedic
              </button>
              <button className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:shadow-md">
                Beauty
              </button>
              <button className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#e0f7fa] dark:hover:bg-gray-700 hover:shadow-md">
                Vitamins
              </button>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for categories, medicines, supplements..."
                  className="w-full px-6 py-4 text-lg rounded-full border-2 border-[#036372] dark:border-[#1fa9be] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#036372]/20 dark:focus:ring-[#1fa9be]/20 shadow-lg"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#036372] dark:bg-[#1fa9be] hover:bg-[#1fa9be] dark:hover:bg-[#036372] text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Alphabet Navigation */}
        <motion.div
          className="mb-8 sticky top-4 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => scrollToLetter('')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                selectedLetter === '' 
                  ? 'bg-[#036372] text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedLetter === letter 
                    ? 'bg-[#036372] text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sort and Clear Filters */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#036372] focus:border-transparent shadow-sm"
            >
              <option value="alphabetical">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <button className="text-sm text-[#036372] dark:text-[#1fa9be] hover:underline font-medium">
            Clear Filters
          </button>
        </motion.div>

        {/* Top Categories Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#036372] dark:text-[#1fa9be]">
              Top Categories
            </h2>
            <Link
              to="/products"
              className="text-[#1fa9be] hover:text-[#036372] dark:text-[#1fa9be] dark:hover:text-white font-medium flex items-center"
            >
              View All Products
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(groupedCategories).map(([letter, letterCategories]) => (
              <div key={letter} id={`letter-${letter}`}>
                {letterCategories.slice(0, 6).map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="mb-4"
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#036372] to-[#1fa9be] rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                          {category.name.charAt(0)}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#036372] dark:group-hover:text-[#1fa9be] transition-colors">
                          {category.name}
                        </h3>
                        {category.productCount && (
                          <p className="text-xs text-gray-500 mt-1">
                            {category.productCount} products
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#036372] dark:text-[#1fa9be]">
              Popular Products
            </h2>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#036372] focus:border-transparent"
              >
                <option value="alphabetical">A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <Link to={`/products/${product._id}`} className="block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#036372] dark:text-[#1fa9be]">
                      ₹{product.price}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Show More Products Button */}
          {filteredProducts.length > 12 && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <button
                onClick={() => setShowMoreProducts(!showMoreProducts)}
                className="inline-flex items-center px-8 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {showMoreProducts ? (
                  <>
                    Show Less
                    <svg className="ml-2 w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Show More Products ({filteredProducts.length - 12} more)
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* All Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#036372] dark:text-[#1fa9be] mb-6">
            All Categories A-Z
          </h2>
          
          {Object.entries(groupedCategories).map(([letter, letterCategories]) => (
            <div key={letter} className="mb-8">
              <h3 className="text-xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4 border-b-2 border-[#036372] dark:border-[#1fa9be] pb-2">
                {letter}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {letterCategories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="block p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#036372] dark:hover:border-[#1fa9be] group"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#036372] to-[#1fa9be] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#036372] dark:group-hover:text-[#1fa9be] transition-colors">
                            {category.name}
                          </h4>
                          {category.productCount && (
                            <p className="text-xs text-gray-500">
                              {category.productCount} products
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
    
    <Footer />
  </div>
  );
};

export default AllCategories;
