import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from '../../lib/motion';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getTotalPrice,
    getItemCount
  } = useCart();

  return (
    <>
      {/* Cart overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCart}
        />
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Cart header */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Shopping Cart ({getItemCount()})
              </h2>
              <button 
                onClick={toggleCart}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-600 mb-4">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
                  <button 
                    onClick={toggleCart}
                    className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>                  {items.map((item, index) => (
                    <motion.div 
                      key={item._id || `cart-item-${index}`} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex border-b dark:border-gray-800 py-4"
                    >
                      {/* Product image */}
                      <div className="w-20 h-20 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden mr-3 flex-shrink-0">
                        <img 
                          src={item.imageUrl || './src/assets/lohasav.jpg'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{item.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span>₹{item.price}</span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="ml-2 text-xs line-through">₹{item.mrp}</span>
                          )}
                        </div>
                        
                        {/* Quantity controls */}
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >-</button>
                          <span className="mx-2 w-8 text-center text-gray-800 dark:text-gray-200">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >+</button>
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </motion.div>
                  ))}

                  {/* Clear cart button */}
                  <div className="flex justify-center mt-4">
                    <button 
                      onClick={clearCart}
                      className="text-sm text-[#036372] dark:text-[#1fa9be] hover:underline"
                    >
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Cart footer */}
            {items.length > 0 && (
              <div className="border-t dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Total:</span>
                  <span className="text-xl font-bold text-[#036372] dark:text-[#1fa9be]">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>                <button 
                  onClick={() => {
                    toggleCart();
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white py-3 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;
