import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from '../lib/motion';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data.product);
        
        // Fetch related products
        const relatedResponse = await axios.get(`http://localhost:5000/api/products?category=${response.data.product.category._id}&limit=5&excludeProduct=${id}`);
        setRelatedProducts(relatedResponse.data.products);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
        setLoading(false);
        toast.error('Error loading product details');
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };
  
  const handleQuantityChange = (value) => {
    const newQty = Math.max(1, Math.min(product?.stock || 10, quantity + value));
    setQuantity(newQty);
  };
  
  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor" 
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
          </svg>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Link 
              to="/products" 
              className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
            >
              Back to Products
            </Link>
          </div>
        ) : product ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumbs */}
            <nav className="flex mb-6 text-sm">
              <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be]">
                Home
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be]">
                Products
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <Link to={`/categories/${product.category._id}`} className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be]">
                {product.category.name}
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-800 dark:text-gray-200">{product.name}</span>
            </nav>
            
            {/* Product Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Image */}
                <div className="lg:w-2/5">
                  <div className="bg-[#e0f7fa]/20 dark:bg-gray-700/20 rounded-lg p-4 flex items-center justify-center">
                    <motion.img 
                      src={product.imageUrl || "./src/assets/lohasav.jpg"}
                      alt={product.name}
                      className="max-h-[400px] object-contain"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="lg:w-3/5">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {product.name}
                  </h1>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {renderStars(product.rating || 4)}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({product.rating || 4}.0) • {product.reviews?.length || 0} Reviews
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-[#036372] dark:text-[#1fa9be] mr-2">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <>
                          <span className="text-lg line-through text-gray-500 dark:text-gray-400 mr-2">
                            ₹{product.mrp}
                          </span>
                          <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-md">
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Inclusive of all taxes
                    </p>
                  </div>
                  
                  {/* Short Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {product.description.substring(0, 150)}...
                  </p>
                  
                  {/* Stock Status */}
                  <div className="mb-6">
                    {product.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        In Stock ({product.stock} available)
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Quantity Selector */}
                  {product.stock > 0 && (
                    <div className="flex items-center mb-6">
                      <span className="mr-4 text-gray-700 dark:text-gray-300">Quantity:</span>
                      <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                        <button 
                          onClick={() => handleQuantityChange(-1)}
                          className="px-3 py-1 border-r border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 flex items-center justify-center text-gray-800 dark:text-gray-200">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(1)}
                          className="px-3 py-1 border-l border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className={`px-6 py-3 rounded-lg font-semibold text-white ${
                        product.stock <= 0 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372]'
                      } transition-colors`}
                      whileHover={{ scale: product.stock <= 0 ? 1 : 1.03 }}
                      whileTap={{ scale: product.stock <= 0 ? 1 : 0.97 }}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </motion.button>
                    
                    <motion.button
                      className="px-6 py-3 rounded-lg font-semibold text-[#036372] dark:text-[#1fa9be] border-2 border-[#036372] dark:border-[#1fa9be] hover:bg-[#e0f7fa]/50 dark:hover:bg-gray-700/50 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Add to Wishlist
                    </motion.button>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.category.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">SKU</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Details Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'description' 
                        ? 'border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'specifications' 
                        ? 'border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'reviews' 
                        ? 'border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Reviews
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-600 dark:prose-p:text-gray-300">
                    <p>{product.description}</p>
                  </div>
                )}
                
                {activeTab === 'specifications' && (
                  <div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { name: 'Brand', value: product.brand || 'Generic' },
                        { name: 'Category', value: product.category.name },
                        { name: 'Prescription Required', value: product.requiresPrescription ? 'Yes' : 'No' },
                        { name: 'Dosage Form', value: product.dosageForm || 'N/A' },
                        { name: 'Package Size', value: product.packageSize || 'N/A' },
                        { name: 'Storage', value: product.storage || 'Store in a cool, dry place' }
                      ].map((item, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="text-gray-600 dark:text-gray-400">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {product.reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div className="font-medium text-gray-800 dark:text-gray-200 mr-2">
                                  {review.user.name}
                                </div>
                                {renderStars(review.rating)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Related Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {relatedProducts.map((relProduct) => (
                    <motion.div 
                      key={relProduct._id}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                    >
                      <Link to={`/products/${relProduct._id}`} className="block">
                        <div className="h-40 bg-[#e0f7fa]/20 dark:bg-gray-700/20 flex items-center justify-center p-4">
                          <img 
                            src={relProduct.imageUrl || "./src/assets/lohasav.jpg"} 
                            alt={relProduct.name}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {relProduct.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-bold text-[#036372] dark:text-[#1fa9be]">
                              ₹{relProduct.price}
                            </span>
                            {relProduct.mrp && relProduct.mrp > relProduct.price && (
                              <span className="text-xs line-through text-gray-500 dark:text-gray-400">
                                ₹{relProduct.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <p className="text-gray-600 dark:text-gray-400">Product not found</p>
            <Link 
              to="/products" 
              className="mt-4 inline-block px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
