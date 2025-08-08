import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../lib/motion';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Card = ({ 
  id, 
  productName, 
  description,
  price,
  mrp,
  imageUrl,
  rating = 4,
  stock = 10,
  discount = 0,
  product
}) => {
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate actual discount if not provided
  const calculatedDiscount = discount || (mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  
  // Get current quantity in cart
  const productId = id || (product && product._id);
  const cartItem = items.find(item => item._id === productId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  const handleAddToCart = () => {
    if (!product && !id) return;
    
    // Prepare product for cart
    const cartProduct = {
      _id: id || product._id,
      name: productName || product.name || 'Unknown Product',
      price: price || mrp || product.price || 0,
      mrp: mrp || product.mrp || price || 0,
      imageUrl: imageUrl || product.imageUrl || '',
      stock: stock || product.stock || 0,
      category: product?.category || { name: 'General' }
    };
    
    // Only add one item at a time from card view
    addToCart(cartProduct, 1);
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-full rounded-xl my-2 sm:my-4 mx-auto group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rounded-xl border border-gray-100 flex flex-col bg-white dark:bg-gray-800 p-2 sm:p-3 shadow-md hover:shadow-lg dark:border-gray-700 h-full transition-all relative">
        {/* Quick action buttons - show on hover */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-2 right-2 flex flex-col gap-2 z-10"
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-[#e0f7fa] dark:hover:bg-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#036372] dark:text-[#1fa9be]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </motion.button>
          <Link to={`/products/${id}`}>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-[#e0f7fa] dark:hover:bg-gray-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#036372] dark:text-[#1fa9be]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Discount tag */}
        {calculatedDiscount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#036372]/10 dark:bg-[#1fa9be]/20 text-[#036372] dark:text-[#1fa9be] text-xs font-semibold px-2.5 py-1 rounded-full">
              {calculatedDiscount}% OFF
            </span>
          </div>
        )}
        
        {/* Out of stock overlay */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium">Out of Stock</span>
          </div>
        )}
        
        {/* Product Image */}
        <Link to={`/products/${id}`} className="block">
          <div className="h-[140px] sm:h-[160px] md:h-[180px] w-full flex items-center justify-center mb-2 sm:mb-4 rounded-lg overflow-hidden bg-[#e0f7fa]/30 dark:bg-gray-700/30">
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="h-[120px] sm:h-[140px] md:h-[160px] object-contain" 
                src={imageUrl || "./src/assets/lohasav.jpg"} 
                alt={productName || "Product image"} 
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "./src/assets/lohasav.jpg";
                }}
              />
            </div>
          </div>
        </Link>
        
        {/* Product Info */}
        <div className="flex-grow flex flex-col">
          {/* Product Name */}
          <Link to={`/products/${id}`} className="block">
            <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[32px] sm:min-h-[40px] hover:text-[#036372] dark:hover:text-[#1fa9be] transition-colors">
              {productName}
            </h3>
          </Link>
          
          {/* Price */}
          <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg font-bold text-[#036372] dark:text-[#1fa9be]">
              ₹{price || mrp}
            </span>
            {mrp && price && mrp > price && (
              <span className="text-xs line-through text-gray-500 dark:text-gray-400">
                ₹{mrp}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center mt-1 mb-1 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}`}
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor" 
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({rating}.0)</span>
          </div>
          
          {/* Stock indicator */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {stock > 10 ? 'In Stock' : stock > 0 ? `Only ${stock} left` : 'Out of Stock'}
          </div>
          
          {/* Add to Cart Button or Quantity Controls */}
          {quantityInCart > 0 ? (
            <div className="mt-auto flex items-center rounded-lg overflow-hidden h-[34px] sm:h-[38px]">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  // If quantity is 1, remove the item completely
                  if (quantityInCart === 1) {
                    removeFromCart(productId);
                  } else {
                    updateQuantity(productId, quantityInCart - 1);
                  }
                }}
                className="bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white h-full w-16  sm:w-20 flex items-center justify-center rounded-l-lg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
              
              <span className="flex-1 text-center font-medium text-xs sm:text-sm h-full flex items-center justify-center border-t border-b border-[#036372]/20 dark:border-[#1fa9be]/20 px-2 sm:px-3 bg-white dark:bg-gray-800">
                {quantityInCart}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (quantityInCart < stock) {
                    updateQuantity(productId, quantityInCart + 1);
                  } else {
                    toast.warning(`Cannot add more than available stock (${stock} items)`);
                  }
                }}
                disabled={quantityInCart >= stock}
                className={`h-full w-16 sm:w-20 flex items-center justify-center rounded-r-lg ${
                  quantityInCart >= stock 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
            </div>
          ) : (
            <motion.button 
              onClick={handleAddToCart}
              disabled={stock <= 0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`mt-auto w-full text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 rounded-lg transition-colors ${
                stock <= 0 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372]'
              }`}
            >
              {stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Card