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
const ADD_QUANTITY = 'ADD_QUANTITY';  // New action type for adding multiple quantities at once
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
    
    case ADD_QUANTITY:
      // Add multiple quantities at once
      const { product, quantity: addQuantity } = action.payload;
      
      if (!product || !product._id) {
        console.error("Invalid product in ADD_QUANTITY:", product);
        return state;
      }
      
      const itemIndex = state.items.findIndex(item => item._id === product._id);
      
      if (itemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        const currentItem = updatedItems[itemIndex];
        const maxStock = currentItem.stock || Infinity;
        
        // Ensure we don't exceed stock
        const newQuantity = Math.min(currentItem.quantity + addQuantity, maxStock);
        updatedItems[itemIndex] = {
          ...currentItem,
          quantity: newQuantity
        };
        
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        return { ...state, items: updatedItems };
      } else {
        // Add new item with specified quantity
        const maxStock = product.stock || Infinity;
        const safeQuantity = Math.min(addQuantity, maxStock);
        
        const newItems = [...state.items, { 
          ...product, 
          quantity: safeQuantity 
        }];
        
        localStorage.setItem('cart', JSON.stringify(newItems));
        return { ...state, items: newItems };
      }
    
    case REMOVE_FROM_CART:
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(filteredItems));
      return { ...state, items: filteredItems };
    
    case UPDATE_QUANTITY:
      const { id, quantity } = action.payload;
      // Make sure quantity doesn't exceed stock
      const updatedItems = state.items.map(item => {
        if (item._id === id) {
          const newQty = Math.min(quantity, item.stock || Infinity);
          return { ...item, quantity: newQty }; // Fixed: was using newQty as property name instead of setting quantity
        }
        return item;
      });
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
  
  // Add item to cart with optional quantity
  const addToCart = (product, quantity = 1) => {
    try {
      // Ensure we have a valid product with required properties
      if (!product || !product._id) {
        console.error("Invalid product:", product);
        toast.error("Cannot add invalid product to cart");
        return;
      }
      
      // Check if product is in stock
      if (product.stock <= 0) {
        toast.error(`${product.name} is out of stock!`);
        return;
      }
      
      // Check if adding this quantity would exceed stock
      const existingItem = state.items.find(item => item._id === product._id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const maxStock = product.stock;
      
      // Calculate how many we can actually add
      let actualQuantityToAdd = quantity;
      
      if (currentQty + quantity > maxStock) {
        toast.warning(`Cannot add more than available stock (${maxStock} items)`);
        actualQuantityToAdd = maxStock - currentQty;
        
        if (actualQuantityToAdd <= 0) {
          toast.info("Item already at maximum available quantity");
          return;
        }
      }
      
      // Dispatch before showing toast to ensure UI updates
      dispatch({ 
        type: ADD_QUANTITY, 
        payload: { product, quantity: actualQuantityToAdd } 
      });
      
      // Show success toast with appropriate message
      if (actualQuantityToAdd === quantity) {
        toast.success(`${quantity > 1 ? `${quantity} items` : product.name} added to cart!`);
      } else {
        toast.info(`Added ${actualQuantityToAdd} ${actualQuantityToAdd > 1 ? 'items' : 'item'} to cart (maximum available)`);
      }
      
      // Force a re-render for components that depend on cart state
      setTimeout(() => {
        dispatch({ type: SET_LOADING, payload: false });
      }, 10);
      
    } catch (error) {
      console.error("Add to cart error:", error);
      dispatch({ type: SET_ERROR, payload: 'Failed to add item to cart' });
      toast.error('Failed to add item to cart');
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    try {
      // Find the item to get its name for the toast message
      const item = state.items.find(item => item._id === productId);
      const itemName = item ? item.name : 'Item';
      
      // Dispatch the action first
      dispatch({ type: REMOVE_FROM_CART, payload: productId });
      
      // Show toast after the state has been updated
      toast.info(`${itemName} removed from cart`);
      
      // Force a re-render for components that depend on cart state
      setTimeout(() => {
        dispatch({ type: SET_LOADING, payload: false });
      }, 10);
    } catch (error) {
      console.error("Remove from cart error:", error);
      dispatch({ type: SET_ERROR, payload: 'Failed to remove item from cart' });
      toast.error('Failed to remove item from cart');
    }
  };
  
  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    try {
      // Check if new quantity exceeds stock
      const item = state.items.find(item => item._id === productId);
      if (!item) return; // Item not found in cart
      
      const oldQuantity = item.quantity;
      const maxStock = item.stock || Infinity;
      
      // Determine the final quantity respecting stock limits
      const finalQuantity = Math.min(quantity, maxStock);
      
      if (quantity > maxStock) {
        toast.warning(`Cannot add more than available stock (${maxStock} items)`);
      }
      
      // Calculate difference for the toast message
      const diff = finalQuantity - oldQuantity;
      
      // Only update if the quantity is actually changing
      if (diff !== 0) {
        // First dispatch then show toast to ensure UI is updated
        dispatch({ 
          type: UPDATE_QUANTITY, 
          payload: { id: productId, quantity: finalQuantity } 
        });
        
        // Show toast notifications
        if (diff > 0) {
          toast.success(`Added ${diff} more to cart`);
        } else if (diff < 0) {
          toast.info(`Removed ${Math.abs(diff)} from cart`);
        }
      }
    } catch (error) {
      console.error("Update quantity error:", error);
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
