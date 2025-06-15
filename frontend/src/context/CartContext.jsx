import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import { toast } from 'react-toastify';

// Create cart context
const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  isOpen: false,
  loading: false,
  error: null
};

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';
const TOGGLE_CART = 'TOGGLE_CART';
const SET_ERROR = 'SET_ERROR';
const SET_LOADING = 'SET_LOADING';
const SET_ITEMS = 'SET_ITEMS';

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_TO_CART:
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(item => item._id === action.payload._id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        const newItems = [...state.items, { ...action.payload, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(newItems));
        return { ...state, items: newItems };
      }
    
    case REMOVE_FROM_CART:
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(filteredItems));
      return { ...state, items: filteredItems };
    
    case UPDATE_QUANTITY:
      const { id, quantity } = action.payload;
      const updatedItems = state.items.map(item => 
        item._id === id ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return { ...state, items: updatedItems };
    
    case CLEAR_CART:
      localStorage.removeItem('cart');
      return { ...state, items: [] };
    
    case TOGGLE_CART:
      return { ...state, isOpen: !state.isOpen };
    
    case SET_ERROR:
      return { ...state, error: action.payload };
      case SET_LOADING:
      return { ...state, loading: action.payload };
      
    case SET_ITEMS:
      return { ...state, items: action.payload };
      
    default:
      return state;
  }
}

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
    // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // If the saved cart is an array of items
          const initialItems = [...parsedCart];
          dispatch({ type: 'SET_ITEMS', payload: initialItems });
        } else {
          // Legacy support - if savedCart isn't in the expected format
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      localStorage.removeItem('cart');
    }
  }, []);
  
  // Add item to cart
  const addToCart = (product) => {
    try {
      dispatch({ type: ADD_TO_CART, payload: product });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      dispatch({ type: SET_ERROR, payload: 'Failed to add item to cart' });
      toast.error('Failed to add item to cart');
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    try {
      dispatch({ type: REMOVE_FROM_CART, payload: productId });
      toast.info('Item removed from cart');
    } catch (error) {
      dispatch({ type: SET_ERROR, payload: 'Failed to remove item from cart' });
      toast.error('Failed to remove item from cart');
    }
  };
  
  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    try {
      dispatch({ 
        type: UPDATE_QUANTITY, 
        payload: { id: productId, quantity } 
      });
    } catch (error) {
      dispatch({ type: SET_ERROR, payload: 'Failed to update quantity' });
      toast.error('Failed to update quantity');
    }
  };
  
  // Clear cart
  const clearCart = () => {
    try {
      dispatch({ type: CLEAR_CART });
      toast.info('Cart cleared');
    } catch (error) {
      dispatch({ type: SET_ERROR, payload: 'Failed to clear cart' });
      toast.error('Failed to clear cart');
    }
  };
  
  // Toggle cart display
  const toggleCart = () => {
    dispatch({ type: TOGGLE_CART });
  };
  
  // Calculate total price
  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Get total items count
  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      getTotalPrice,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  return useContext(CartContext);
};
