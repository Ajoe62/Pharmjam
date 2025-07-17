// contexts/CartContext.tsx - Global cart state management
// Context allows us to share cart data across different screens

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product, CartItem, Cart } from "../types";

// Define what actions we can perform on the cart
type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_CUSTOMER"; customerName: string };

// Initial cart state - empty cart
const initialCartState: Cart = {
  items: [],
  total: 0,
  customerName: undefined,
};

// Reducer function - this is where cart logic happens
// Think of it as a function that takes current state + action = new state
function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "ADD_ITEM": {
      console.log("🛒 Adding item to cart:", action.product.name);

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + action.quantity,
                subtotal:
                  (item.quantity + action.quantity) * item.product.price,
              }
            : item
        );
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          product: action.product,
          quantity: action.quantity,
          subtotal: action.product.price * action.quantity,
        };
        newItems = [...state.items, newItem];
      }

      // Calculate new total
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
      };
    }

    case "REMOVE_ITEM": {
      console.log("🗑️ Removing item from cart:", action.productId);

      const newItems = state.items.filter(
        (item) => item.product.id !== action.productId
      );
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
      };
    }

    case "UPDATE_QUANTITY": {
      console.log(
        "📝 Updating quantity for:",
        action.productId,
        "to:",
        action.quantity
      );

      if (action.quantity <= 0) {
        // If quantity is 0 or less, remove item
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          productId: action.productId,
        });
      }

      const newItems = state.items.map((item) =>
        item.product.id === action.productId
          ? {
              ...item,
              quantity: action.quantity,
              subtotal: action.quantity * item.product.price,
            }
          : item
      );

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
      };
    }

    case "CLEAR_CART": {
      console.log("🧹 Clearing cart");
      return initialCartState;
    }

    case "SET_CUSTOMER": {
      console.log("👤 Setting customer:", action.customerName);
      return {
        ...state,
        customerName: action.customerName,
      };
    }

    default:
      return state;
  }
}

// Context type definition
interface CartContextType {
  cart: Cart;
  cartItems: CartItem[]; // Add cartItems for compatibility
  addItem: (product: Product, quantity: number) => void;
  addToCart: (product: Product) => void; // Add addToCart for compatibility
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customerName: string) => void;
  getItemCount: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component - wraps our app to provide cart functionality
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // Helper functions that components can use
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: "ADD_ITEM", product, quantity });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setCustomer = (customerName: string) => {
    dispatch({ type: "SET_CUSTOMER", customerName });
  };

  const getItemCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Add compatibility function for addToCart
  const addToCart = (product: Product) => {
    addItem(product, 1);
  };

  const value: CartContextType = {
    cart,
    cartItems: cart.items, // Expose cartItems for compatibility
    addItem,
    addToCart, // Add compatibility function
    removeItem,
    updateQuantity,
    clearCart,
    setCustomer,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
