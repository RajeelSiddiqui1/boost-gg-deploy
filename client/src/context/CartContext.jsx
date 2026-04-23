import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
 const [cartItems, setCartItems] = useState([]);
 const [isCartOpen, setIsCartOpen] = useState(false);
 const [cartMode, setCartMode] = useState(null); // 'boosting', 'currency', 'accounts'
 const [pendingItem, setPendingItem] = useState(null);
 const [showModeMismatchModal, setShowModeMismatchModal] = useState(false);

 // Load cart from local storage on mount
 useEffect(() => {
 const savedCart = localStorage.getItem('boostgg_cart');
 if (savedCart) {
 const parsed = JSON.parse(savedCart);
 setCartItems(parsed);
 if (parsed.length > 0) {
 setCartMode(parsed[0].mode || 'boosting');
 }
 }
 }, []);

 // Save cart to local storage when it changes
 useEffect(() => {
 localStorage.setItem('boostgg_cart', JSON.stringify(cartItems));
 }, [cartItems]);

 const addToCart = (product, mode = 'boosting') => {
 // Mode Isolation Check
 if (cartItems.length > 0 && cartMode !== mode) {
 setPendingItem({ ...product, mode });
 setShowModeMismatchModal(true);
 return;
 }

 setCartItems(prev => {
 // Set mode if empty
 if (prev.length === 0) {
 setCartMode(mode);
 }

 // Check if item already exists
 const existingItemIndex = prev.findIndex(item =>
 item.id === product.id &&
 JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions) &&
 item.calcValue === product.calcValue
 );

 if (existingItemIndex > -1) {
 const newCart = [...prev];
 newCart[existingItemIndex].quantity += (product.quantity || 1);
 return newCart;
 }
 return [...prev, { ...product, mode, quantity: product.quantity || 1 }];
 });
 setIsCartOpen(true);
 };

 const confirmClearAndAdd = () => {
 if (pendingItem) {
 setCartItems([{ ...pendingItem, quantity: 1 }]);
 setCartMode(pendingItem.mode);
 setPendingItem(null);
 setShowModeMismatchModal(false);
 setIsCartOpen(true);
 }
 };

 const cancelModeMismatch = () => {
 setPendingItem(null);
 setShowModeMismatchModal(false);
 };

 const removeFromCart = (index) => {
 setCartItems(prev => prev.filter((_, i) => i !== index));
 };

 const clearCart = () => {
 setCartItems([]);
 setCartMode(null);
 };

 const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
 const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

 return (
 <CartContext.Provider value={{
 cartItems,
 addToCart,
 removeFromCart,
 clearCart,
 cartTotal,
 cartCount,
 isCartOpen,
 setIsCartOpen,
 cartMode,
 showModeMismatchModal,
 confirmClearAndAdd,
 cancelModeMismatch,
 pendingItem
 }}>
 {children}
 </CartContext.Provider>
 );
};
